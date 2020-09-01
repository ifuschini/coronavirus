<template>
  <div>
    <div class="row">
      Last Update: {{lastUpdate}}
      <!--va-button small color="info" @click="showMediumModal = true">
            update
          </va-button-->
    </div>
    <div class = "row">
      <div class="flex md3 xs12">
        <va-select
          label="Select region"
          v-model="searchableSelectModel"
          searchable
          textBy="description"
          :options="arrayNameRegion"
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
            <va-chart :data="objectDataRegion" type="line"/>
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
        Updated regions: <br/><br/>
        <va-data-table
          :fields="fieldsModal"
          :data="newData"
          no-pagination
          @click="star(props.rowData)"
        >
          <template slot="actions" slot-scope="props">
            <va-button flat small color="gray" @click="changeRegion(props.rowData.Region)" class="ma-0">
              GO
            </va-button>
          </template>
        </va-data-table>
      </div>
      <!--va-button v-for="region in newData" v-bind:key="region" v-on:click="changeRegion(region)" flat color="info">
                        {{ region.Region }}
                    </va-button-->

    </va-modal>

  </div>
</template>
<script>
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
        name: 'IntensiveTherapy',
        title: 'Intensive Therapy',
        width: '12%',
      },
      {
        name: 'HospitalizedSymptoms',
        title: 'Hospitalized Symptoms',
        width: '12%',
      },
      {
        name: 'HomeIsolation',
        title: 'Home Isolation',
        width: '12%',
      },
      {
        name: 'Swabs',
        title: 'Swabs',
        width: '12%',
      },
      {
        name: 'SwabsDayPerDay',
        title: 'Swabs Day per Day',
        width: '12%',
      },
      {
        name: '__slot:actions',
        dataClass: 'text-right',
      },
      {
        name: '__slot:actions',
        dataClass: 'text-right',
      },
      ]
    },

    fieldsModal () {
      return [{
        name: 'Region',
        title: 'Region',
        width: '14%',
      },
      {
        name: 'Confirmed',
        title: 'Confirmed',
        width: '14%',
      },
      {
        name: 'Deaths',
        title: 'Deaths',
        width: '12%',
      },
      {
        name: 'Recovered',
        title: 'Recovered',
        width: '12%',
      },
      {
        name: 'IntensiveTherapy',
        title: 'Intensive Therapy',
        width: '12%',
      },
      {
        name: 'HospitalizedSymptoms',
        title: 'Hospitalized Symptoms',
        width: '12%',
      },
      {
        name: 'HomeIsolation',
        title: 'Home Isolation',
        width: '12%',
      },
      {
        name: 'Swabs',
        title: 'Swabs',
        width: '12%',
      },
      {
        name: 'SwabsDayPerDay',
        title: 'SwabsDayPerDay',
        width: '12%',
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
      objectDataRegion: {
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
      newData: [],
      lastUpdate: null,
      searchableSelectModel: null,
      arrayRegions: [],
      arrayNameRegion: [],
      arrayTable: [],
      arrayDataRegions: null,
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
    this.startCron()
  },
  watch: {
    tabValue () {
      if (this.tabValue === 0) {
        this.showGraph = true
      } else {
        this.showGraph = false
      }
    },
    searchableSelectModel () {
      console.log('CHANGE')
      this.showDataRegion(this.searchableSelectModel)
      const path = '/coronanations/italy/' + encodeURI(this.searchableSelectModel)
      if (this.$route.path !== path) this.$router.push({ path: path })
    },
    typeModel () {
      this.showDataRegion(this.searchableSelectModel)
    },
  },
  methods: {
    formatNumber (num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    },
    changeRegion (region) {
      console.log('CHANGE')
      this.showDataRegion(region)
      const path = '/coronanations/italy/' + encodeURI(region)
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
    lastRegionsUpdate () {
      const regionData = this.arrayDataRegions[Object.keys(this.arrayDataRegions)[0]]
      const arrayDate = Object.keys(regionData)
      const lastDate = arrayDate[arrayDate.length - 1]
      this.newData = []
      for (let i = 0; i < this.arrayDataRegions.newData.length; i++) {
        let regionName = this.arrayDataRegions.newData[i]
        console.log(regionName)
        console.log(this.arrayDataRegions[regionName])
        // bad patch
        if (regionName === 'Valle d') regionName = "Valle d'Aosta"
        if (this.arrayDataRegions[regionName][lastDate]) {
          const regionObject = this.arrayDataRegions[regionName][lastDate]

          this.newData.push({
            Region: regionName,
            Confirmed: String(regionObject.Confirmed),
            Deaths: String(regionObject.deceduti),
            Recovered: String(regionObject.dimessi_guariti),
          })
        }
      }
      console.log(this.newData)
    },
    showDataRegion (region) {
      // console.log(this.arrayNameRegion.indexOf(region))
      if (!this.arrayDataRegions[region]) {
        region = Object.keys(this.arrayDataRegions)[0]
      }
      this.searchableSelectModel = region
      const regionData = this.arrayDataRegions[region]
      const arrayDate = Object.keys(regionData)
      const lastDate = arrayDate[arrayDate.length - 1]
      const arrayConfirmed = []
      const arrayDeaths = []
      const arrayRecovered = []
      const arrayRate = []
      const arrayDateShow = []
      this.arrayTable = []
      this.confirmed = regionData[lastDate].Confirmed
      this.recovered = regionData[lastDate].dimessi_guariti
      this.deaths = regionData[lastDate].deceduti

      this.lastUpdate = this.timeConverter(this.arrayDataRegions.timestamp)
      for (let i = 0; i < arrayDate.length; i++) {
        let dayPerDay = '0'
        let dayPerDayOrder = ''
        let dayPerDayPercent = 0
        let swabsdayperday = 0
        if (i > 0 && regionData[arrayDate[i - 1]].Confirmed > 0) {
          dayPerDay = regionData[arrayDate[i]].Confirmed - regionData[arrayDate[i - 1]].Confirmed
          dayPerDayPercent = (regionData[arrayDate[i]].Confirmed - regionData[arrayDate[i - 1]].Confirmed) / regionData[arrayDate[i - 1]].Confirmed * 100
          dayPerDayPercent = dayPerDayPercent.toFixed(2)
        }
        if (i > 0) {
          swabsdayperday = parseInt(regionData[arrayDate[i]].tamponi) - parseInt(regionData[arrayDate[i - 1]].tamponi)
          console.log(parseInt(regionData[arrayDate[i]].tamponi) + '<->' + parseInt(regionData[arrayDate[i - 1]].tamponi))
        }
        dayPerDay = String(dayPerDay)
        for (let i = 0; i < 10 - dayPerDay.length; i++) dayPerDayOrder = dayPerDayOrder + '0'
        let sign = ''
        arrayRate.push(dayPerDayPercent)
        if (dayPerDayPercent > 0) sign = '+'
        this.arrayTable.push({
          DateOrder: arrayDate[i],
          Date: arrayDate[i].substring(6) + '/' + arrayDate[i].substring(4, 6) + '/' + arrayDate[i].substring(0, 4),
          Confirmed: String(regionData[arrayDate[i]].Confirmed),
          Deaths: String(regionData[arrayDate[i]].deceduti),
          Recovered: String(regionData[arrayDate[i]].dimessi_guariti),
          DayPerDay: dayPerDay,
          DayPerDayOrder: dayPerDayOrder + dayPerDay,
          DayPerDayPercent: sign + dayPerDayPercent + '%',
          IntensiveTherapy: regionData[arrayDate[i]].terapia_intensiva,
          HospitalizedSymptoms: regionData[arrayDate[i]].ricoverati_con_sintomi,
          HomeIsolation: regionData[arrayDate[i]].isolamento_domiciliare,
          Swabs: regionData[arrayDate[i]].tamponi,
          SwabsDayPerDay: swabsdayperday,
        })
      }
      this.arrayTable = this.arrayTable.reverse()
      const arrayIntensiveTherapy = []
      const arrayHospitalizedSymptoms = []
      const arrayHomeIsolation = []
      const arraySwabs = []
      if (this.typeModel === 'Total') {
        for (let i = 0; i < arrayDate.length; i++) {
          arrayDateShow.push(arrayDate[i].substring(6) + '/' + arrayDate[i].substring(4, 6))
          arrayConfirmed.push(regionData[arrayDate[i]].Confirmed)
          arrayDeaths.push(regionData[arrayDate[i]].deceduti)
          arrayRecovered.push(regionData[arrayDate[i]].dimessi_guariti)
          arrayIntensiveTherapy.push(regionData[arrayDate[i]].terapia_intensiva)
          arrayHospitalizedSymptoms.push(regionData[arrayDate[i]].ricoverati_con_sintomi)
          arrayHomeIsolation.push(regionData[arrayDate[i]].isolamento_domiciliare)
          arraySwabs.push(regionData[arrayDate[i]].tamponi)
        }
      } else {
        for (let i = 1; i < arrayDate.length; i++) {
          arrayDateShow.push(arrayDate[i].substring(6) + '/' + arrayDate[i].substring(4, 6))
          arrayConfirmed.push(regionData[arrayDate[i]].Confirmed - regionData[arrayDate[i - 1]].Confirmed)
          arrayDeaths.push(regionData[arrayDate[i]].deceduti - regionData[arrayDate[i - 1]].deceduti)
          arrayRecovered.push(regionData[arrayDate[i]].dimessi_guariti - regionData[arrayDate[i - 1]].dimessi_guariti)
          arrayIntensiveTherapy.push(regionData[arrayDate[i]].terapia_intensiva - regionData[arrayDate[i - 1]].terapia_intensiva)
          arrayHospitalizedSymptoms.push(regionData[arrayDate[i]].ricoverati_con_sintomi - regionData[arrayDate[i]].ricoverati_con_sintomi)
          arrayHomeIsolation.push(regionData[arrayDate[i]].isolamento_domiciliare - regionData[arrayDate[i - 1]].isolamento_domiciliare)
          arraySwabs.push(regionData[arrayDate[i]].tamponi - regionData[arrayDate[i]].tamponi)
        }
      }
      this.objectDataRegion = {
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
    getRegions () {
      axios
        .get('data/commons/italy.json')
        .then(response => {
          this.arrayRegions = response.data
          this.arrayNameRegion = []
          for (let i = 0; i < response.data.length; i++) {
            this.arrayNameRegion.push(response.data[i].Name)
          }

          this.getDataRegions(this.arrayNameRegion[0])
        })
        .catch(e => {
          this.error = e
        })
    },
    getDataRegions (region) {
      axios
        .get('data/commons/italyData.json')
        .then(response => {
          this.arrayDataRegions = response.data
          if (this.$route.params.id !== undefined) region = this.$route.params.id
          // this.lastRegionsUpdate()
          this.showDataRegion(region)
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
      this.getRegions()
      if (this.cronCheck === null) {
        this.cronCheck = setInterval(function () {
          this.getRegions()
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
