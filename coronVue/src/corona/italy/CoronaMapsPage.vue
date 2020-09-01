<template>
  <div>
    Last Update: {{lastUpdate}}
    <div class="bubble-maps-page">
      <div class="flex xs12">
        <va-tabs v-model="tabValue" style="width: 100%; min-width: 250px;">
          <va-tab>
            Map
          </va-tab>
          <va-tab>
            Data
          </va-tab>
        </va-tabs>
      </div>
      <br/>
      <div v-if="tabValue==0">
        <div class="flex xs12">
          <va-progress-bar :value="progress"><span style="font-size: 15px;">{{dateToShow}}</span></va-progress-bar>
        </div>
        <div class="row">
          <div class="flex md12 xs12">
            <va-card
              class="bubble-maps-page__widget"
              title=""
            >
              <corona-map
                style="height: 65vh;"
              />
            </va-card>
          </div>
        </div>
        <div class="row">
          <div class="flex xs12 xl6">
            <va-button-group>
              <va-button outline large v-on:click="player('backward')" color="info" icon="glyphicon glyphicon-backward"> </va-button>
              <va-button outline large v-on:click="player('pause')" color="info" :icon="iconPlayPause"> </va-button>
              <va-button outline large v-on:click="player('forward')" color="info" icon="glyphicon glyphicon-forward"> </va-button>
            </va-button-group>
          </div>
        </div>
      </div>
      <div v-if="tabValue==1" class="row">

        <div class="flex md4 xs12">
          <va-select
            label="Select date"
            v-model="searchableSelectModel"
            searchable
            textBy="description"
            :options="arrayDateToShow"
          />
        </div>
        <div class="flex xs12 md4">
          <va-card title="Italy">
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
        <div class="flex md12 xs12">
          <va-card :title="searchableSelectModel">
            <va-data-table
              :fields="fields"
              :data="arrayTable"
              no-pagination
              @click="star(props.rowData)"
            >
            </va-data-table>
          </va-card>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import CoronaMap from './CoronaMaps'
import { serverBus } from '../../app/main'
import axios from 'axios'

export default {
  name: 'bubble-maps-page',
  components: {
    CoronaMap,
  },
  computed: {
    fields () {
      return [{
        name: 'Nation',
        title: 'Nation',
        width: '12%',
      },
      {
        name: 'Confirmed',
        title: 'Confirmed',
        width: '8%',
      },
      {
        name: 'DayPerDay',
        title: 'Confirmed Day per Day',
        width: '8%',
      },
      {
        name: 'DayPerDayPercent',
        title: 'Confirmed % Day per Day',
        width: '8%',
      },
      {
        name: 'Deaths',
        title: 'Deaths',
        width: '8%',
      },
      {
        name: 'PercentOfDeaths',
        title: '% of Deaths',
        width: '8%',
        sortField: 'OrderPercentOfDeaths',

      },
      {
        name: 'Recovered',
        title: 'Recovered',
        width: '8%',
      },
      {
        name: 'PercentOfRecovered',
        title: '% of Recovered',
        width: '8%',
        sortField: 'OrderPercentOfRecovered',
      },
      {
        name: 'IntensiveTherapy',
        title: 'Intensive Therapy',
        width: '8%',
      },
      {
        name: 'HospitalizedSymptoms',
        title: 'Hospitalized Symptoms',
        width: '8%',
      },
      {
        name: 'HomeIsolation',
        title: 'Home Isolation',
        width: '8%',
      },
      {
        name: 'Swabs',
        title: 'Swabs',
        width: '8%',
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
      progress: 50,
      iconPlayPause: 'glyphicon glyphicon-pause',
      searchableSelectModel: '',
      arrayNations: [],
      arrayNameNation: [],
      arrayDate: [],
      lastUpdate: [],
      dateToShow: null,
      arrayDateToShow: [],
      arrayTable: [],
      confirmed: 0,
      recovered: 0,
      deaths: 0,
    }
  },
  created () {
    serverBus.$on('progress', (objectFromMap) => {
      this.progress = objectFromMap.percent
      this.dateToShow = objectFromMap.date
    })
    this.getDataNations()
  },
  watch: {
    $route () {
      serverBus.$emit('stopCron', null)
      this.getDataNations()
    },
    tabValue () {
      if (this.tabValue === 0) {
        serverBus.$emit('playerAction', 'play')
        this.iconPlayPause = 'glyphicon glyphicon-pause'
      } else {
        serverBus.$emit('playerAction', 'pause')
        this.iconPlayPause = 'glyphicon glyphicon-play'
      }
    },
    searchableSelectModel () {
      this.showDataTable(this.searchableSelectModel)
    },
  },
  methods: {
    formatNumber (num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
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

    normalizeDate () {
      console.log('Normalize')
      const arrayDate = Object.keys(this.arrayDataNations.Lombardia).reverse()
      this.arrayDateToShow = []
      for (let i = 0; i < arrayDate.length; i++) {
        this.arrayDateToShow.push(
          arrayDate[i].substring(6) + '/' +
              arrayDate[i].substring(4, 6) + '/' +
              arrayDate[i].substring(0, 4),
        )
      }
      this.searchableSelectModel = this.arrayDateToShow[0]
      this.lastUpdate = this.timeConverter(this.arrayDataNations.timestamp)
      this.showDataTable(this.searchableSelectModel)
    },
    showDataTable (date) {
      const indexDate = this.arrayDateToShow.indexOf(date)
      const arrayDate = Object.keys(this.arrayDataNations.Lombardia).reverse()
      console.log('arrayDate')
      console.log(arrayDate)
      const dateToShow = arrayDate[indexDate]
      let dateBeforeShow = dateToShow
      if (indexDate < arrayDate.length) dateBeforeShow = arrayDate[indexDate + 1]
      this.confirmed = 0
      this.deaths = 0
      this.recovered = 0
      this.arrayTable = []
      const keyNation = Object.keys(this.arrayDataNations)
      for (let i = 0; i < keyNation.length; i++) {
        if (this.arrayDataNations[keyNation[i]][dateToShow] !== undefined) {
          this.confirmed = this.confirmed + parseInt(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed)
          this.deaths = this.deaths + parseInt(this.arrayDataNations[keyNation[i]][dateToShow].deceduti)
          this.recovered = this.recovered + parseInt(this.arrayDataNations[keyNation[i]][dateToShow].dimessi_guariti)
          let delta = String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed)
          let dayPerDayPercent = '0.00'
          let sign = ''
          if (this.arrayDataNations[keyNation[i]][dateBeforeShow] !== undefined) {
            delta = String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed - this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed)
            dayPerDayPercent = (this.arrayDataNations[keyNation[i]][dateToShow].Confirmed - this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed) / this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed * 100
            dayPerDayPercent = dayPerDayPercent.toFixed(2)
          }
          const percentOfDeath = this.arrayDataNations[keyNation[i]][dateToShow].deceduti / this.arrayDataNations[keyNation[i]][dateToShow].Confirmed * 100
          const percentOfRecovered = this.arrayDataNations[keyNation[i]][dateToShow].dimessi_guariti / this.arrayDataNations[keyNation[i]][dateToShow].Confirmed * 100
          let orderPercentOfDeaths = ''
          let orderPercentOfRecovered = ''
          for (let i = 0; i < 10 - String(percentOfDeath).length; i++) orderPercentOfDeaths = '0' + orderPercentOfDeaths
          for (let i = 0; i < 10 - String(percentOfRecovered).length; i++) orderPercentOfRecovered = '0' + orderPercentOfRecovered

          if (dayPerDayPercent > 0) sign = '+'
          const objectOfData = {
            Nation: keyNation[i],
            Confirmed: String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed),
            Deaths: String(this.arrayDataNations[keyNation[i]][dateToShow].deceduti),
            PercentOfDeaths: percentOfDeath.toFixed(2) + '%',
            OrderPercentOfDeaths: orderPercentOfDeaths,
            Recovered: String(this.arrayDataNations[keyNation[i]][dateToShow].dimessi_guariti),
            PercentOfRecovered: percentOfRecovered.toFixed(2) + '%',
            IntensiveTherapy: String(this.arrayDataNations[keyNation[i]][dateToShow].terapia_intensiva),
            HospitalizedSymptoms: String(this.arrayDataNations[keyNation[i]][dateToShow].ricoverati_con_sintomi),
            HomeIsolation: String(this.arrayDataNations[keyNation[i]][dateToShow].isolamento_domiciliare),
            Swabs: String(this.arrayDataNations[keyNation[i]][dateToShow].tamponi),
            OrderPercentOfRecovered: orderPercentOfRecovered,
            DayPerDay: delta,
            DayPerDayPercent: sign + dayPerDayPercent + '%',
          }
          this.arrayTable.push(objectOfData)
        }
      }
      this.arrayTable.sort(function (a, b) {
        return b.Confirmed - a.Confirmed
      })
    },
    getDataNations () {
      axios
        .get('data/commons/italyData.json')
        .then(response => {
          this.arrayDataNations = response.data
          this.normalizeDate()
        })
        .catch(e => {
          this.error = e
        })
    },
    player (action) {
      if (action === 'pause') {
        if (this.iconPlayPause === 'glyphicon glyphicon-play') {
          this.iconPlayPause = 'glyphicon glyphicon-pause'
          action = 'play'
        } else {
          this.iconPlayPause = 'glyphicon glyphicon-play'
          action = 'pause'
        }
      } else {
        this.iconPlayPause = 'glyphicon glyphicon-play'
      }
      serverBus.$emit('playerAction', action)
    },
    star ({ id }) {
      const i = this.dataTable.findIndex(row => row.id === id)
      this.dataTable[i].starred = !this.dataTable[i].starred
    },

  },

}
</script>
