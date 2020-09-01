<template>
  <div>
    <div class="row">
      Last Update: {{lastUpdate}}
      <va-button small color="info" @click="showMediumModal = true">
        update
      </va-button>
    </div>
    <div class = "row">
      <div class="flex md3 xs12">
        <va-select
          label="Select nation"
          v-model="searchableSelectModel"
          searchable
          textBy="description"
          :options="arrayNameNation"
        />
      </div>
      <div class="flex md3 xs12" v-if="showGraph==true">
        <va-select
          label="Type"
          v-model="typeModel"
          textBy="description"
          :options="typeOfAnalisys"
        />
      </div>
      <div class="flex xs12 md6">
        <va-card>
          <div class="row row-separated">
            <div class="flex xs4">
              <p class="display-2 mb-1 text--center" :style="{color: this.$themes.warning}">{{formatNumber(confirmed)}}</p>
              <p class="text--center mb-1">Confirmed</p>
            </div>
            <div class="flex xs4">
              <p class="display-2 mb-1 text--center" :style="{color: this.$themes.danger}">{{formatNumber(deaths)}}</p>
              <p class="text--center no-wrap mb-1">Deaths</p>
            </div>
            <div class="flex xs4">
              <p class="display-2 mb-1 text--center" :style="{color: this.$themes.success}">{{formatNumber(recovered)}}</p>
              <p class="text--center mb-1">Recovered</p>
            </div>
            <div class="flex xs4" v-if="mediumAge!=='N/A'">
              <p class="display-2 mb-1 text--center" :style="{color: this.$themes.default}" >{{formatNumber(mediumAge)}}</p>
              <p class="text--center mb-1">Medium Age</p>
            </div>
            <div class="flex xs4" v-if="mediumAge!=='N/A'">
              <p class="display-2 mb-1 text--center" :style="{color: this.$themes.default}">{{formatNumber(expectancyAge)}}</p>
              <p class="text--center mb-1">Expectancy Age</p>
            </div>
          </div>
        </va-card>
      </div>
    </div>
    <div>
      <div class="flex xs12">
        <va-tabs v-model="tabValue" style="width: 100%; min-width: 250px;">
          <va-tab>
            Graph
          </va-tab>
          <va-tab>
            Data
          </va-tab>
          <va-tab>
            Growth Rate
          </va-tab>
        </va-tabs>
      </div>

      <div class="row">
        <div class="flex md12 xs12" v-if="tabValue==0">
          <va-card
            class="chart-widget"
            :title="searchableSelectModel"
          >
            <va-chart :data="objectDataNation" type="line"/>
          </va-card>
        </div>
        <div class="flex md12 xs12" v-if="tabValue==1">
          <va-card :title="searchableSelectModel">
            <va-data-table
              :fields="fields"
              :data="arrayTable"
              no-pagination
            >
            </va-data-table>
          </va-card>
        </div>
        <div class="flex md12 xs12" v-if="tabValue==2">
          <va-card
            class="chart-widget"
            :title="searchableSelectModel"
          >
            <va-chart :data="objectDataRate" type="line"/>
          </va-card>
        </div>
      </div>
    </div>
    <va-modal
      v-model="showMediumModal"
      title="Last new"
      hideDefaultActions
    >
      <div class="flex xs12 md14">
        Updated nations: <br/><br/>
        <va-data-table
          :fields="fieldsModal"
          :data="newData"
          no-pagination
          @click="star(props.rowData)"
        >
          <template slot="actions" slot-scope="props">
            <va-button flat small color="gray" @click="changeNation(props.rowData.Nation)" class="ma-0">
              GO
            </va-button>
          </template>
        </va-data-table>
      </div>
      <!--va-button v-for="nation in newData" v-bind:key="nation" v-on:click="changeNation(nation)" flat color="info">
                        {{ nation.Nation }}
                    </va-button-->

    </va-modal>

  </div>
</template>
<script>
import { serverBus } from '../../app/main'
import axios from 'axios'
import { hex2rgb } from '../../services/vuestic-ui'

export default {
  name: 'DefaultContainer',
  components: {},
  computed: {
    fields () {
      return [{
        name: 'Date',
        title: 'Date',
        width: '20%',
        sortField: 'DateOrder',
      },
      {
        name: 'Confirmed',
        title: 'Confirmed',
        width: '20%',
      },
      {
        name: 'DayPerDay',
        title: 'Confirmed Day per Day',
        width: '15%',
        sortField: 'DayPerDayOrder',
      },
      {
        name: 'DayPerDayPercent',
        title: 'Percent Day per Day',
        width: '15%',
      },
      {
        name: 'Deaths',
        title: 'Deaths',
        width: '15%',
      }, {
        name: 'Recovered',
        title: 'Recovered',
        width: '15%',
      },
      {
        name: '__slot:actions',
        dataClass: 'text-right',
      },
      ]
    },
    fieldsModal () {
      return [{
        name: 'Nation',
        title: 'Nation',
        width: '55%',
      },
      {
        name: 'Confirmed',
        title: 'Confirmed',
        width: '15%',
      },
      {
        name: 'Deaths',
        title: 'Deaths',
        width: '15%',
      }, {
        name: 'Recovered',
        title: 'Recovered',
        width: '15%',
      },
      {
        name: '__slot:actions',
        dataClass: 'text-right',
      },
      ]
    },
  },
  data () {
    return {
      tabValue: 0,
      objectDataNation: {
        labels: [],
        datasets: [],
      },
      objectDataRate: {
        labels: [],
        datasets: [],
      },
      showMediumModal: false,
      showGraph: true,
      message: '',
      mediumAge: '',
      expectancyAge: '',
      hashAge: {},
      newData: [],
      lastUpdate: null,
      searchableSelectModel: 'All',
      arrayNations: [],
      arrayNameNation: [],
      arrayTable: [],
      arrayDataNations: null,
      confirmed: 0,
      recovered: 0,
      deaths: 0,
      typeModel: 'Total',
      typeOfAnalisys: [
        'Total',
        'Day by Day',
      ],
    }
  },
  created () {
    this.getAge()
  },
  watch: {
    $route () {
      serverBus.$emit('stopCron', null)
      serverBus.$emit('stopItalyCron', null)
    },
    tabValue () {
      if (this.tabValue === 0) {
        this.showGraph = true
      } else {
        this.showGraph = false
      }
    },
    searchableSelectModel () {
      this.showDataNation(this.searchableSelectModel)
      const path = '/corona/coronavirus/' + this.searchableSelectModel
      if (this.$route.path !== path) this.$router.push({ path: path })
    },
    typeModel () {
      this.showDataNation(this.searchableSelectModel)
    },
  },
  methods: {
    formatNumber (num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    },
    changeNation (nation) {
      this.showDataNation(nation)
      const path = '/corona/coronavirus/' + nation
      if (this.$route.path !== path) this.$router.push({ path: path })
      this.showMediumModal = false
    },
    timeConverter (UnixTimestamp) {
      var a = new Date(UnixTimestamp * 1000)
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      var year = a.getFullYear()
      var month = months[a.getMonth()]
      var date = a.getDate()
      var hour = a.getHours()
      var min = a.getMinutes()
      var sec = a.getSeconds()
      if (hour < 10) hour = '0' + hour
      if (min < 10) min = '0' + min
      if (sec < 10) sec = '0' + sec
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec
      return time
    },
    lastNationsUpdate () {
      const nationData = this.arrayDataNations.All
      const arrayDate = Object.keys(nationData)
      const lastDate = arrayDate[arrayDate.length - 1]
      this.newData = []
      for (let i = 0; i < this.arrayDataNations.newData.length; i++) {
        const nationName = this.arrayDataNations.newData[i]
        try {
          if (this.arrayDataNations[nationName][lastDate]) {
            const nationObject = this.arrayDataNations[nationName][lastDate]
            this.newData.push({
              Nation: nationName,
              Confirmed: String(nationObject.Confirmed),
              Deaths: String(nationObject.Deaths),
              Recovered: String(nationObject.Recovered),
            })
          }
        } catch (e) {
          console.log(nationName)
          console.log(e)
        }
      }
      console.log(this.newData)
    },
    showDataNation (nation) {
      // console.log(this.arrayNameNation.indexOf(nation))
      if (!this.arrayDataNations[nation]) {
        nation = 'All'
      }
      if (this.hashAge[nation]) {
        this.mediumAge = this.hashAge[nation].mediumAge.toFixed(2)
        this.expectancyAge = this.hashAge[nation].expectancyAge.toFixed(2)
      } else {
        this.mediumAge = 'N/A'
        this.expectancyAge = 'N/A'
      }
      this.searchableSelectModel = nation
      const nationData = this.arrayDataNations[nation]
      const arrayDate = Object.keys(nationData)
      const lastDate = arrayDate[arrayDate.length - 1]
      const arrayConfirmed = []
      const arrayDeaths = []
      const arrayRecovered = []
      const arrayRate = []
      const arrayDateShow = []
      this.arrayTable = []
      this.confirmed = nationData[lastDate].Confirmed
      this.recovered = nationData[lastDate].Recovered
      this.deaths = nationData[lastDate].Deaths

      this.lastUpdate = this.timeConverter(this.arrayDataNations.timestamp)
      for (let i = 0; i < arrayDate.length; i++) {
        let dayPerDay = '0'
        let dayPerDayOrder = ''
        let dayPerDayPercent = 0
        if (i > 0) {
          dayPerDay = nationData[arrayDate[i]].Confirmed - nationData[arrayDate[i - 1]].Confirmed
          dayPerDayPercent = (nationData[arrayDate[i]].Confirmed - nationData[arrayDate[i - 1]].Confirmed) / nationData[arrayDate[i - 1]].Confirmed * 100
          dayPerDayPercent = dayPerDayPercent.toFixed(2)
        }
        dayPerDay = String(dayPerDay)
        for (let i = 0; i < 10 - dayPerDay.length; i++) dayPerDayOrder = dayPerDayOrder + '0'
        let sign = ''
        arrayRate.push(dayPerDayPercent)
        if (dayPerDayPercent > 0) sign = '+'
        this.arrayTable.push({
          DateOrder: arrayDate[i],
          Date: arrayDate[i].substring(6) + '/' + arrayDate[i].substring(4, 6) + '/' + arrayDate[i].substring(0, 4),
          Confirmed: String(nationData[arrayDate[i]].Confirmed),
          Deaths: String(nationData[arrayDate[i]].Deaths),
          Recovered: String(nationData[arrayDate[i]].Recovered),
          DayPerDay: dayPerDay,
          DayPerDayOrder: dayPerDayOrder + dayPerDay,
          DayPerDayPercent: sign + dayPerDayPercent + '%',
        })
      }
      this.arrayTable = this.arrayTable.reverse()
      if (this.typeModel === 'Total') {
        for (let i = 0; i < arrayDate.length; i++) {
          arrayDateShow.push(arrayDate[i].substring(6) + '/' + arrayDate[i].substring(4, 6))
          arrayConfirmed.push(nationData[arrayDate[i]].Confirmed)
          arrayDeaths.push(nationData[arrayDate[i]].Deaths)
          arrayRecovered.push(nationData[arrayDate[i]].Recovered)
        }
      } else {
        for (let i = 1; i < arrayDate.length; i++) {
          arrayDateShow.push(arrayDate[i].substring(6) + '/' + arrayDate[i].substring(4, 6))
          arrayConfirmed.push(nationData[arrayDate[i]].Confirmed - nationData[arrayDate[i - 1]].Confirmed)
          arrayDeaths.push(nationData[arrayDate[i]].Deaths - nationData[arrayDate[i - 1]].Deaths)
          arrayRecovered.push(nationData[arrayDate[i]].Recovered - nationData[arrayDate[i - 1]].Recovered)
        }
      }
      this.objectDataNation = {
        labels: arrayDateShow,
        datasets: [
          {
            label: 'Confirmed',
            backgroundColor: hex2rgb(this.$themes.warning, 0.3).css,
            borderColor: 'transparent',
            data: arrayConfirmed,
          },
          {
            label: 'Deaths',
            backgroundColor: hex2rgb(this.$themes.danger, 0.3).css,
            borderColor: 'transparent',
            data: arrayDeaths,
          },
          {
            label: 'Recovered',
            backgroundColor: hex2rgb(this.$themes.primary, 0.3).css,
            borderColor: 'transparent',
            data: arrayRecovered,
          },
        ],
      }
      this.objectDataRate = {
        labels: arrayDateShow,
        datasets: [
          {
            label: 'Growth Rate',
            backgroundColor: hex2rgb(this.$themes.primary, 0.3).css,
            borderColor: 'transparent',
            data: arrayRate,
          },
        ],
      }
    },
    getAge () {
      axios
        .get('data/commons/dataAge.json')
        .then(response => {
          this.hashAge = response.data
          this.startCron()
        })
        .catch(e => {
          this.error = e
        })
    },
    getDataNations () {
      axios
        .get('data/commons/nationsData.json')
        .then(response => {
          this.arrayDataNations = response.data
          let nation = 'All'
          if (this.$route.params.id !== undefined) nation = this.$route.params.id
          console.log('eccomi')
          this.lastNationsUpdate()
          const arrayDate = Object.keys(response.data.All)
          const lastDate = arrayDate[arrayDate.length - 1]
          const allNations = Object.keys(response.data)
          const arrayNationToSort = []
          for (let i = 0; i < allNations.length; i++) {
            if (response.data[allNations[i]][lastDate]) {
              const obj = response.data[allNations[i]][lastDate]
              obj.nation = allNations[i]
              console.log(allNations[i])
              arrayNationToSort.push(obj)
            } else {
              console.log('not found:' + allNations[i])
              console.log(response.data[allNations[i]])
            }
          }
          arrayNationToSort.sort(function (a, b) {
            return b.Confirmed - a.Confirmed
          })
          this.arrayNameNation = []
          for (let i = 0; i < arrayNationToSort.length; i++) {
            this.arrayNameNation.push(arrayNationToSort[i].nation)
          }
          this.showDataNation(nation)
        })
        .catch(e => {
          this.error = e
        })
    },
    star ({ id }) {
      const i = this.dataTable.findIndex(row => row.id === id)
      this.dataTable[i].starred = !this.dataTable[i].starred
    },
    startCron () {
      console.log('start cron')
      this.getDataNations()
      if (this.cronCheck === null) {
        this.cronCheck = setInterval(function () {
          this.getDataNations()
        }.bind(this), 300000)
      }
    },

  },

}
</script>

<style lang="scss">
.chart-widget {
  .va-card__body {
    height: 70vh;
  }
}
</style>
