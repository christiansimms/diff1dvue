<template>
  <h3>Matcher</h3>
  <div style="display: flex; flex: 1 1 0">
    <div class="grid-container">
      <p>Before: {{ before }}</p>
      <p>After: {{ after }}</p>
    </div>
    <div class="grid-container">
      <button v-on:click="restart">Restart</button>
      <button v-on:click="doStep">Step</button>
      <div v-if="message">Message: {{message}}</div>
      Step: {{step}}
    </div>
  </div>

  <!-- Keep this out of vuejs or else it won't display properly. LETS HOPE NOT TRUE! -->
  <div id="sketch-holder">
    <!-- Our sketch will go here! -->
  </div>

  <div v-if="nodesNotDone.length > 0">
    List of nodes not done:
    <div v-for="node in nodesNotDone" :key="node.id">
      <p>{{node.id}}: {{node.getLabel()}}</p>
    </div>
  </div>

  <div v-if="ruleNodes.length > 0">
    Rule nodes:
    <div v-for="node in ruleNodes" :key="node.id">
      <p>{{node.id}}: {{node.getLabel()}}, IN: {{node.inNode.getLabel()}}, OUT: {{node.outNode.getLabel()}}</p>
    </div>
  </div>

  <div v-if="outputNodes.length > 0">
    Output nodes:
    <div class="grid-container">
      <p>Before: {{ before2 }}</p>
<!--      <p>After: {{ after }}</p>-->
    </div>

    <div v-for="node in outputNodes" :key="node.id">
      <p>{{node.id}}: {{node.getLabel()}}</p>
    </div>
  </div>


</template>

<script setup lang="ts">
import {onMounted, Ref, ref} from 'vue';
import {Node} from '../util/nodeInterface.ts';
import {OutputNode} from '../util/outputNode.ts';
import {RuleNode} from '../util/ruleNode.ts';
import {Runner} from '../util/runner';
import {Network} from 'vis-network';


const props = defineProps<{ before?: string[], after?: string[], before2?: string[] }>()

let runner: Runner;

const step: Ref<number> = ref(10);

const message: Ref<string> = ref("");
function run() {
  runner = new Runner(props.before!, props.after!, props.before2!);
  runner.installMatchers();
  const defaultSteps = 20;
  const stepsCompleted = runner.runUntilDone(defaultSteps, true, true);
  if (stepsCompleted) {
    message.value = `Completed in ${stepsCompleted} steps.`;
    step.value = stepsCompleted;
  } else {
    message.value = `Not completed in ${defaultSteps} steps.`;
  }
  displayGraph();
}

function restart() {
  runner = new Runner(props.before!, props.after!, props.before2!);
  runner.installMatchers();
  displayGraph();
  step.value = 0;
  message.value = "";
  console.log("Restarted");
}

function doStep() {
  step.value = step.value + 1;
  const isDone = runner.doStep();
  if (isDone) {
    message.value = "Done!";
  }
  displayGraph();
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

const nodesNotDone: Ref<Node[]> = ref([]);
const ruleNodes: Ref<RuleNode[]> = ref([]);
const outputNodes: Ref<OutputNode[]> = ref([]);
function displayGraph() {
  const permData = runner.graph.getAllNodes();
  const data = {
    nodes: permData.nodes,
    edges: permData.edges
  };
  network.setData(data);
  nodesNotDone.value = runner.graph.nodeArray().filter(n => !n.isDone);
  ruleNodes.value = runner.graph.nodeArray().filter(n => n instanceof RuleNode);
  outputNodes.value = runner.graph.nodeArray().filter(n => n instanceof OutputNode);
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

.grid-container {
  margin: 10px;
}
</style>
