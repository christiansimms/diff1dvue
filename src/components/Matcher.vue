<template>
  <h3>Matcher</h3>
  <p>Before: {{ before }}</p>
  <p>After: {{ after }}</p>

  <!-- Keep this out of vuejs or else it won't display properly. LETS HOPE NOT TRUE! -->
  <div id="sketch-holder">
    <!-- Our sketch will go here! -->
  </div>

</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import {Runner} from '../util/runner';
import {Network} from 'vis-network';


const props = defineProps<{ before?: string[], after?: string[] }>()

let runner: Runner;

function run() {
  runner = new Runner(props.before!, props.after!);
  runner.installMatchers();
  runner.doStep();
  runner.doStep();  // TODO: twice to get correct score
  runner.doStep();
  runner.doStep();
  // runner.doStep();
  // runner.doStep();
  // runner.doStep();
  // runner.doStep();
  // runner.doStep();
  // runner.doStep();
  displayGraph();
  console.log("Node array: ", runner.graph.nodeArray());
}

// Display graph.
let network: Network;  // this MUST NOT be vue-reactive, or else one label is displayed on all nodes!!! TRUE???

function setupNetwork() {
  // Make visjs network.
  const container = document.getElementById('sketch-holder');
  if (!container) {
    throw new Error("Container not found!");
  }

  let data = {
    nodes: [],
    edges: []
  };

  let options = {
    edges: {
      arrows: {to: true}
    },
    layout: {
      hierarchical: {
        direction: 'UD',
        sortMethod: 'directed'  // wow, this is needed, default is: 'hubsize'
      }
    }
  };
  network = new Network(container, data, options);
}

function displayGraph() {
  const permData = runner.graph.getAllNodes();
  const data = {
    nodes: permData.nodes,
    edges: permData.edges
  };
  network.setData(data);
}

onMounted(() => {
  setupNetwork();
  run();
});

</script>

<style scoped>
#sketch-holder {
  /*width: 100%; /*1000px; 600px */
  height: 600px;
  border: 1px solid lightgray;
}
</style>
