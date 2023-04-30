<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function go_to_home() {
  router.push({ name: "home" });
}
</script>

<template>
  <nav id="navbar">
    <div @click="go_to_home" id="logo-group">
      <img src="/cropit_logo.svg">
    </div>
    <div id="navlinks">
      <a class="navlink" href="https://github.com/jlucartc"><img src="/github.svg" id="github-icon"/></a>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
#navbar {
  z-index: 1;
  min-width: 100%;
  font-family: helvetica;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  #logo-group {
    cursor: pointer;
    margin: 30px 0px 30px 90px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
  }

  #navlinks {
    margin: 30px 90px 30px 90px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;

    .navlink {
      margin: 0px 30px 0px 0px;
      font-size: 1.5em;

      &:last-child {
        margin: 0;
      }

      #github-icon{
        width: 40px;
        aspect-ratio: 1;
      }
    }
  }
}

@media screen and (max-width: 960px){
  #navbar{
    justify-content: space-around;

    #logo-group{
      margin: 30px 0px 30px 0px;
    }

    #navlinks{
      margin: 30px 0px 30px 0px;
    }
  }
}
</style>
