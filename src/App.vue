<script setup lang="ts">
import Matcher from './components/Matcher.vue';
</script>

<template>
  <div>
    <p>Given 2 arrays of characters, match and find diffs.</p>
  </div>
<!--    <Matcher :before="['a', null]"  :after="[null, null]"/>-->
<!--  <Matcher :before="[null, null]"  :after="['a', null]"/>-->
<!--  <Matcher :before="['a', '']"  :after="['', 'a']" :before2="['', 'a', '']"  />-->

<!--  <Matcher :before="['a', null, null]"  :after="[null, 'a', null]"/>-->
<!--  <Matcher :before="['a', null]"  :after="[null, 'a']"/>-->
  <!-- Below is a conflict -->
<!--    <Matcher :before="['a', 'a', null]"  :after="['a', null, 'a']"/>-->

  <Matcher :before="['a', 'b', 'c', 'd', 'e']"  :after="['', 'a', 'b', 'c', 'd', 'e']" :before2="['d', '']"/>
<!--  <Matcher :before="['a', 'b', 'c', 'd', 'e']"  :after="['b', 'a', 'c', 'e', 'd']"/>-->
<!--  <Matcher :before="['a', 'b', 'c', 'd', 'e']"  :after="['e', 'd', 'c', 'b', 'a']"/>-->
</template>

<style scoped>
</style>
