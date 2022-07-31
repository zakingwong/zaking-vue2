<template>
  <div id="app">
    <li>{{$store.state.name}}</li>
    <li>{{$store.getters.introduce}}</li>
    <li>{{$store.getters.introduce}}</li>
    <li>{{$store.getters.introduce}}</li>
    <li>{{$store.getters.introduce}}</li>
    <li>{{$store.getters.introduce}}</li>
    <button @click="handleMutationClick">改名换姓mutation</button>
    <button @click="handleActionClick">改名换姓action</button>
    <br>
    <p>a模块</p>
    <p>{{$store.state.a.name}}</p>
    <p>{{$store.getters['a/introduce']}}</p>

    <button @click="$store.commit('a/changeName','小王吧-A')">改名换姓mutation-A</button>
    <br>
    <p>c模块</p>
    <p>{{$store.state.c.name}}</p>
    <button @click="$store.commit('c/changeName','小王吧-C')">改名换姓mutation-C</button>
    <br>
    <p>e模块</p>
    <p>{{$store.state.a.e.name}}</p>
    <p>e模块的getters</p>
    <p>{{$store.getters['a/e/introduce']}}</p>
    <button @click="$store.commit('a/e/changeName','小王吧-E')">改名换姓mutation-E</button>
    <br>
    <p>mapState:</p>
    <p>{{name}}</p>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
function mapState(stateList){
  let obj = {};
  for (let i = 0; i < stateList.length; i++) {
    let stateKey = stateList[i];
    obj[stateKey] = function (){
      return this.$store.state[stateKey];
    }
  }
  return obj;
}

function mapActions(actionList){
  let obj = {};
    for (let i = 0; i < actionList.length; i++) {
    let actionKey = actionList[i];
    obj[actionKey] = function (payload){
      return this.$store.dispatch(actionKey,payload)
    }
  }
  return obj;
}

export default {
  name: 'App',
  computed: {
    ...mapState([
      // 映射 this.name 为 store.state.name
      'name'
    ]),
  },
  methods:{
    handleMutationClick(){
      this.$store.commit('changeName','小王吧')
    },
handleActionClick(){
  this.$store.dispatch('changeName').then(()=>{
    console.log('finished')
  })
},
  }
}
</script>

