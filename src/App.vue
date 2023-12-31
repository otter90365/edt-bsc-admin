<template>
  <v-app class="app" :class="$route.name">
    <v-navigation-drawer
      v-if="$route.name !== 'Login'"
      class="side-bar"
      v-model="isDrawer"
      dark
      fixed
      :mini-variant.sync="sidebarClose"
      width="245"
      :permanent="$store.state.nowWidth >= 960"
      :temporary="$store.state.nowWidth < 960"
      :color="$vuetify.theme.themes.light.primary"
    >
      <v-list>
        <v-list-item class="logo mx-2">
          <v-list-item-icon>
            <img src="@/assets/img/logo.png" alt="logo" width="35px">
          </v-list-item-icon>
          <v-list-item-title>
            <div class="rem-0">EGT Defi</div>
            <div class="rem-4">智能合約借貸應用</div>
          </v-list-item-title>
        </v-list-item>
        <div
          class="icon-expand lightPrimary rounded-circle d-none d-md-flex justify-center align-center can-click"
          @click="sidebarClose = !sidebarClose"
        >
          <v-icon color="black">{{ sidebarClose ? 'mdi-chevron-right' : 'mdi-chevron-left'}}</v-icon>
        </div>
      </v-list>

      <v-list
        nav
        dense
        class="mt-md-8 mt-5"
      >
        <v-list-item
          link
          v-for="nav in navList"
          :key="nav.link"
          :style="{opacity: nav.link === $route.name ? 1 : 0.3}"
          @click="clickNav(nav)"
        >
          <v-list-item-icon>
            <img :src="`${require(`@/assets/img/${nav.img}.svg`)}`" :alt="nav.text">
          </v-list-item-icon>
          <v-list-item-title class="rem-4 font-weight-bold">{{ nav.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <div class="account-block white--text w-100 text-center d-md-none d-block" v-if="!sidebarClose">
        <div class="font-weight-bold rem-12">{{ $store.state.userInfo.name }}</div>
        <div class="font-weight-bold rem-2">管理員 {{ $store.state.userInfo.account }}</div>
        
        <v-btn class="rounded-lg mt-8" outlined color="lightOrange" height="25" @click="log()">登出</v-btn>
      </div>
    </v-navigation-drawer>

    <v-main
      id="main"
      :class="{'pb-md-16 px-md-15 py-5 px-5': $route.name !== 'Login', 
               'ml-14': $route.name !== 'Login' && $store.state.nowWidth >= 960}"
    >
      <router-view />
    </v-main>

    <loading :loadingShow="$store.state.loading.isShow" :content="$store.state.loading.text"></loading>
  </v-app>
</template>

<script>
import loading from '@/components/loading.vue'
import base from '@/mixin/base'
export default {
  name: 'App',
  mixins: [base],
  data: () => ({
    isDrawer: false,
    sidebarClose: true,
    navList: [
      {
        text: '白名單管理',
        link: 'Whitelist',
        img: 'icon-nav-whitelist'
      },
      {
        text: '貸款中名單',
        link: 'Order-Loaning',
        img: 'icon-nav-loaning',
      },
      {
        text: '未媒合名單',
        link: 'Order-Pending',
        img: 'icon-nav-pending'
      },
      {
        text: '已結單名單',
        link: 'Order-Close',
        img: 'icon-nav-finished'
      },
      {
        text: '權限名單管理',
        link: 'Authority',
        img: 'icon-nav-authority'
      },
    ]
  }),
  components:{
    loading
  },
  watch: {
    isDrawer(newVal) {
      this.$store.commit('updateSidebarClose', !newVal)
    },
    "$store.state.sidebarClose"(newVal) {
      this.isDrawer = !newVal
    },
  },
  computed:{
    currPage() {
      let page = this.navList.find(item => this.$route.name === item.link)
      if (page) {
        return page
      } else {
        return {}
      }
    }
  },
  methods:{
    async log(){
      if (this.$store.state.token){
        this.$store.commit('clearInfo')
        this.$cookies.remove('address')
        this.$cookies.remove('token')
        this.$router.push({name: 'Login'})
      }else{
        if (window.ethereum) {
          await this.connectMetamask()
        } else {
          window.addEventListener('ethereum#initialized', this.connectMetamask, {
            once: true,
          });

          // If the event is not dispatched by the end of the timeout,
          // the user probably doesn't have MetaMask installed.
          setTimeout(this.connectMetamask, 2000); // 3 seconds
        }
        this.$forceUpdate()
      }
    },
    clickNav(nav) {
      this.$router.push({name: nav.link})
      this.sidebarClose = true
    }
  },
  async mounted(){
    // console.log('==========default==========')
    let _this = this

    this.$store.commit('updateNowWidth', document.body.clientWidth)
    window.onresize = () => {
      this.$store.commit('updateNowWidth', document.body.clientWidth)
    }

    if (!this.$store.state.ethPrice) {
      await this.$store.dispatch('getEthPrice')
    }

    if (window.ethereum){
      // metamask disconnect
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0){
          this.$store.commit('clearInfo')
          this.$cookies.remove('address')
          this.$cookies.remove('token')
          this.$router.push({name: 'Login'})

          this.$toasted.error('MetaMask 連接中斷，請重新登入')
        }else{
          if (this.$store.state.account) {
            this.$store.commit('clearInfo')
            this.$cookies.remove('address')
            this.$cookies.remove('token')
            this.$router.push({name: 'Login'})
          } else {
            this.$store.commit('updateAccount', accounts[0]);
            this.$cookies.set('address', accounts[0]);
            this.$toasted.show('已切換連接錢包');
            window.location.reload()
          }
        }
      });

      // get chain id
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.checkChainId(chainId)
      window.ethereum.on('chainChanged', _this.checkChainId);

      if (!window.ethereum.selectedAddress){
        let address = this.$cookies.get('address')
        if (address){
          this.$cookies.remove('address')
        }
      }
    }
  }
};
</script>

<style lang="scss">
@import '../src/assets/scss/font.scss';
@import url('https://fonts.googleapis.com/css2?family=Share+Tech&family=Tauri&display=swap');
// layout
.app{
  cursor: default;
}
#main{}

.side-bar {
  position: fixed;
  overflow: visible;
  .logo {
    padding: 30px 0;
    border-bottom: #D9D9D9 solid 1px;
    @include dai_vuetify_md {
      padding: 20px 0;
    }
  }
  .icon-expand {
    position: absolute;
    width: 30px;
    height: 30px;
    right: -15px;
  }
  .account-block {
    position: absolute;
    bottom: 50px;
    @include dai_vuetify_sm {
      bottom: 100px;
    }
  }
}

.header-block {
  padding-bottom: 28px;
  border-bottom: var(--v-darkPrimary1-base) solid 2px;
}

.title-text {
  padding-bottom: 12px;
  border-bottom: var(--v-lightPrimary-base) solid 2px;
}

.v-navigation-drawer__border {
  width: 0 !important;
}

// page color
.Order-Loaning {
  --v-primary-base: #86AE15 !important;
  --v-lightPrimary-base: #B5B68B !important;
  --v-darkPrimary1-base: #7D7F2D !important;
  --v-darkPrimary2-base: #454915 !important;
}
.Order-Pending {
  --v-primary-base: #718AD2 !important;
  --v-lightPrimary-base: #C0C7DB !important;
  --v-darkPrimary1-base: #164986 !important;
  --v-darkPrimary2-base: #0C1829 !important;
}
.Order-Close {
  --v-primary-base: #773B8C !important;
  --v-lightPrimary-base: #C4A9CD !important;
  --v-darkPrimary1-base: #7D5C7C !important;
  --v-darkPrimary2-base: #250E43 !important;
}
.Whitelist {
  --v-primary-base: #EBC154 !important;
  --v-lightPrimary-base: #EAD876 !important;
  --v-darkPrimary1-base: #AA8D45 !important;
  --v-darkPrimary2-base: #CD7F32 !important;
}
.Authority {
  --v-primary-base: #37B8A1 !important;
  --v-lightPrimary-base: #C0E0DE !important;
  --v-darkPrimary1-base: #0F7B7B !important;
  --v-darkPrimary2-base: #0C2926 !important;
}

// common style
.pre-wrap {
  white-space: pre-wrap;
}
.break-all {
  word-break: break-all;
}
.can-click {
  cursor: pointer;
}
.w-100 {
  width: 100%;
}
.h-100 {
  height: 100%;
}
.toasted.toasted-primary.error{
  background-color: var(--v-error-base) !important;
}
.toasted.toasted-primary.default{
  background-color: var(--v-primary-base) !important;
}
</style>