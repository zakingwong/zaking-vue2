<template>
  <div id="app">
    <div id="nav">
      <router-link to="/" tag="span">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>
