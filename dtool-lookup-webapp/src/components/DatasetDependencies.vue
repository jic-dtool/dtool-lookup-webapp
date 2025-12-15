<template>
  <div class="dependencies-section">
    <!-- Settings Panel -->
    <v-card variant="outlined" class="mb-3 pa-3">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="18" class="mr-2" color="primary">mdi-cog</v-icon>
          <span class="text-caption text-medium-emphasis">Dependency Keys</span>
        </div>
        <v-btn
          size="x-small"
          variant="text"
          :icon="showSettings ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showSettings = !showSettings"
        />
      </div>

      <v-expand-transition>
        <div v-show="showSettings" class="mt-3">
          <v-combobox
            v-model="dependencyKeys"
            :items="defaultDependencyKeys"
            label="Dependency keys (paths to UUID references)"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            hint="e.g., readme.derived_from.uuid, annotations.source_dataset_uuid"
            persistent-hint
            class="mb-2"
          />
          <div class="d-flex justify-end gap-2">
            <v-btn
              size="small"
              variant="text"
              @click="resetDependencyKeys"
            >
              Reset to defaults
            </v-btn>
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              :loading="loading"
              @click="loadGraph"
            >
              Apply
            </v-btn>
          </div>
        </div>
      </v-expand-transition>

      <!-- Collapsed view: show current keys as chips -->
      <div v-if="!showSettings && dependencyKeys.length > 0" class="mt-2">
        <div class="d-flex flex-wrap gap-1">
          <v-chip
            v-for="key in dependencyKeys"
            :key="key"
            size="x-small"
            variant="outlined"
            color="primary"
          >
            {{ key }}
          </v-chip>
        </div>
      </div>
    </v-card>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8">
      <v-icon size="48" color="error" class="mb-2">mdi-alert-circle</v-icon>
      <p class="text-body-2 text-error">{{ error }}</p>
      <v-btn size="small" variant="tonal" color="primary" class="mt-2" @click="loadGraph">
        Retry
      </v-btn>
    </div>

    <!-- Empty state (no dependencies) -->
    <div v-else-if="!hasConnections" class="text-center py-8 text-medium-emphasis">
      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-graph-outline</v-icon>
      <p class="text-body-2">No dependency connections found</p>
      <p class="text-caption">This dataset has no references matching the configured dependency keys</p>
    </div>

    <!-- Graph visualization -->
    <div v-else class="graph-container" ref="graphContainer">
      <svg ref="svgElement" class="graph-svg"></svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredNode"
        class="graph-tooltip"
        :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
      >
        <div class="tooltip-header">{{ hoveredNode.name }}</div>
        <div class="tooltip-row">
          <span class="tooltip-label">Creator:</span>
          <span>{{ hoveredNode.creator_username }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Created:</span>
          <span>{{ formatDate(hoveredNode.created_at) }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Frozen:</span>
          <span>{{ formatDate(hoveredNode.frozen_at) }}</span>
        </div>
        <div v-if="hoveredNode.size_in_bytes" class="tooltip-row">
          <span class="tooltip-label">Size:</span>
          <span>{{ filesize(hoveredNode.size_in_bytes) }}</span>
        </div>
        <div v-if="hoveredNode.number_of_items" class="tooltip-row">
          <span class="tooltip-label">Items:</span>
          <span>{{ hoveredNode.number_of_items }}</span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="hasConnections" class="graph-legend mt-3">
      <div class="legend-item">
        <span class="legend-node current"></span>
        <span class="text-caption">Current dataset</span>
      </div>
      <div class="legend-item">
        <span class="legend-node related"></span>
        <span class="text-caption">Related dataset</span>
      </div>
      <div class="legend-item">
        <span class="legend-arrow">&rarr;</span>
        <span class="text-caption">Derived from (dependency direction)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import * as d3 from "d3";
import { filesize as filesizeLib } from "filesize";
import moment from "moment";
import { useStore } from "@/store";
import { dserverApi } from "@/services/dserverApi";
import type { GraphDatasetEntry } from "@/services/dserverApi";

// Types for D3 graph
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  uuid: string;
  name: string;
  uri: string;
  base_uri: string;
  creator_username: string;
  created_at: number;
  frozen_at: number;
  size_in_bytes?: number;
  number_of_items?: number;
  isCurrent: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | string;
  target: GraphNode | string;
}

// Emits
const emit = defineEmits<{
  (e: "select-dataset", uuid: string, uri: string): void;
}>();

const store = useStore();

// Default dependency keys matching the server defaults
const defaultDependencyKeys = [
  "readme.derived_from.uuid",
  "annotations.source_dataset_uuid",
];

// Dependency keys configuration
const dependencyKeys = ref<string[]>([...defaultDependencyKeys]);
const showSettings = ref(false);

// Refs
const graphContainer = ref<HTMLDivElement | null>(null);
const svgElement = ref<SVGSVGElement | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const graphData = ref<GraphDatasetEntry[]>([]);
const hoveredNode = ref<GraphNode | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

// D3 simulation reference
let simulation: d3.Simulation<GraphNode, GraphLink> | null = null;

const currentDataset = computed(() => store.current_dataset);

// Reset dependency keys to defaults
function resetDependencyKeys(): void {
  dependencyKeys.value = [...defaultDependencyKeys];
}

const hasConnections = computed(() => {
  if (graphData.value.length <= 1) return false;
  // Check if any dataset has derived_from connections
  return graphData.value.some(d => d.derived_from && d.derived_from.length > 0);
});

// Watch for dataset changes
watch(() => currentDataset.value?.uuid, async (newUuid) => {
  if (newUuid) {
    await loadGraph();
  }
}, { immediate: true });

// Watch for when the graph container becomes available (tab becomes visible)
watch([graphContainer, svgElement], ([container, svg]) => {
  if (container && svg && graphData.value.length > 0) {
    console.log("Container/SVG now available, rendering graph");
    renderGraph();
  }
});

async function loadGraph(): Promise<void> {
  const uuid = currentDataset.value?.uuid;
  if (!uuid) return;

  loading.value = true;
  error.value = null;

  try {
    // Pass custom dependency keys if they differ from defaults or if explicitly set
    const keysToUse = dependencyKeys.value.length > 0 ? dependencyKeys.value : undefined;
    graphData.value = await dserverApi.getDependencyGraph(uuid, keysToUse);
    console.log("Graph data loaded:", graphData.value);
    console.log("Has connections:", hasConnections.value);
    console.log("Using dependency keys:", keysToUse);
    await nextTick();
    renderGraph();
  } catch (err) {
    console.error("Failed to load dependency graph:", err);
    error.value = "Failed to load dependency graph";
    graphData.value = [];
  } finally {
    loading.value = false;
  }
}

function renderGraph(): void {
  console.log("renderGraph called", {
    svgElement: svgElement.value,
    graphContainer: graphContainer.value,
    dataLength: graphData.value.length
  });
  if (!svgElement.value || !graphContainer.value || graphData.value.length === 0) return;

  // Clear previous graph
  d3.select(svgElement.value).selectAll("*").remove();
  if (simulation) simulation.stop();

  const container = graphContainer.value;
  const width = container.clientWidth;
  const height = Math.max(400, container.clientHeight);
  console.log("Container dimensions:", { width, height });

  const svg = d3.select(svgElement.value)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  // Create zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);

  // Create container group for zoom/pan
  const g = svg.append("g");

  // Define arrow marker for directed edges
  const defs = svg.append("defs");
  defs.append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)  // Position relative to target node (accounting for radius ~15)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("xoverflow", "visible")
    .append("path")
    .attr("d", "M 0,-4 L 8,0 L 0,4")
    .attr("fill", "#666")
    .attr("stroke", "none");

  // Build nodes and links
  const currentUuid = currentDataset.value?.uuid;
  const nodes: GraphNode[] = graphData.value.map(d => ({
    id: d.uuid,
    uuid: d.uuid,
    name: d.name,
    uri: d.uri,
    base_uri: d.base_uri,
    creator_username: d.creator_username,
    created_at: d.created_at,
    frozen_at: d.frozen_at,
    size_in_bytes: d.size_in_bytes,
    number_of_items: d.number_of_items,
    isCurrent: d.uuid === currentUuid,
  }));

  const nodeMap = new Map(nodes.map(n => [n.uuid, n]));
  const links: GraphLink[] = [];

  // Build directed links from derived_from relationships
  // Arrow points from source (parent) to target (derived dataset)
  // Note: derived_from contains UUID strings, not objects
  graphData.value.forEach(dataset => {
    if (dataset.derived_from) {
      dataset.derived_from.forEach(depUuid => {
        // depUuid is a string (the parent dataset's UUID)
        if (typeof depUuid === 'string' && nodeMap.has(depUuid)) {
          links.push({
            source: depUuid,
            target: dataset.uuid,
          });
        }
      });
    }
  });

  console.log("Nodes:", nodes);
  console.log("Links:", links);
  console.log("Raw graph data derived_from fields:", JSON.stringify(graphData.value.map(d => ({
    name: d.name,
    uuid: d.uuid,
    derived_from: d.derived_from
  })), null, 2));

  // Create simulation
  simulation = d3.forceSimulation<GraphNode>(nodes)
    .force("link", d3.forceLink<GraphNode, GraphLink>(links)
      .id(d => d.id)
      .distance(150))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(50));

  // Draw links
  const link = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#666")
    .attr("stroke-opacity", 0.8)
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)");

  // Draw nodes
  const node = g.append("g")
    .attr("class", "nodes")
    .selectAll<SVGGElement, GraphNode>("g")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .call(drag(simulation));

  // Node circles
  node.append("circle")
    .attr("r", d => d.isCurrent ? 20 : 15)
    .attr("fill", d => d.isCurrent ? "#1976D2" : "#42A5F5")
    .attr("stroke", d => d.isCurrent ? "#0D47A1" : "#1976D2")
    .attr("stroke-width", d => d.isCurrent ? 3 : 2)
    .style("cursor", "pointer");

  // Node labels
  node.append("text")
    .text(d => truncateName(d.name, 15))
    .attr("dy", 35)
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .attr("fill", "#333");

  // Node interactions
  node
    .on("mouseenter", (event, d) => {
      hoveredNode.value = d;
      updateTooltipPosition(event);
    })
    .on("mousemove", (event) => {
      updateTooltipPosition(event);
    })
    .on("mouseleave", () => {
      hoveredNode.value = null;
    })
    .on("click", (event, d) => {
      console.log("Node clicked:", d);
      if (!d.isCurrent) {
        console.log("Emitting select-dataset", d.uuid, d.uri);
        emit("select-dataset", d.uuid, d.uri);
      }
    });

  // Update positions on tick
  let tickCount = 0;
  simulation.on("tick", () => {
    if (tickCount === 0) {
      console.log("First tick - link data:", links.map(l => ({
        source: (l.source as GraphNode).uuid,
        target: (l.target as GraphNode).uuid,
        x1: (l.source as GraphNode).x,
        y1: (l.source as GraphNode).y,
        x2: (l.target as GraphNode).x,
        y2: (l.target as GraphNode).y,
      })));
    }
    tickCount++;

    link
      .attr("x1", d => (d.source as GraphNode).x!)
      .attr("y1", d => (d.source as GraphNode).y!)
      .attr("x2", d => (d.target as GraphNode).x!)
      .attr("y2", d => (d.target as GraphNode).y!);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });
}

function drag(sim: d3.Simulation<GraphNode, GraphLink>) {
  function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    if (!event.active) sim.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    if (!event.active) sim.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag<SVGGElement, GraphNode>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

function updateTooltipPosition(event: MouseEvent): void {
  const container = graphContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  tooltipPosition.value = {
    x: event.clientX - rect.left + 15,
    y: event.clientY - rect.top + 15,
  };
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + "...";
}

function formatDate(timestamp: number): string {
  return moment.unix(timestamp).format("YYYY-MM-DD HH:mm");
}

function filesize(bytes: number): string {
  return filesizeLib(bytes) as string;
}

// Handle resize
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (graphContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (graphData.value.length > 0) {
        renderGraph();
      }
    });
    resizeObserver.observe(graphContainer.value);
  }
});

onUnmounted(() => {
  if (simulation) simulation.stop();
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.dependencies-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graph-container {
  flex: 1;
  min-height: 400px;
  position: relative;
  background-color: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.graph-svg {
  width: 100%;
  height: 100%;
}

.graph-tooltip {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  pointer-events: none;
  z-index: 1000;
  min-width: 200px;
}

.tooltip-header {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #1976D2;
  word-break: break-word;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.tooltip-label {
  color: #666;
  margin-right: 8px;
}

.graph-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-node.current {
  background-color: #1976D2;
  border: 2px solid #0D47A1;
}

.legend-node.related {
  background-color: #42A5F5;
  border: 2px solid #1976D2;
}

.legend-arrow {
  font-size: 16px;
  color: #666;
}

/* D3 node styling */
:deep(.node circle:hover) {
  filter: brightness(1.1);
}

:deep(.node.current circle) {
  stroke-width: 3px;
}
</style>
