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
          <va-tab>
            Age
          </va-tab>
          <va-tab>
            Age Graph
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
      <div v-if="tabValue  === 1" class="row">

        <div class="flex md4 xs12">
          <va-select
            label="Select date"
            v-model="searchableSelectModel"
            searchable
            textBy="description"
            :options="arrayDateToShow"
          />
        </div>
        <div class="flex xs12 md6">
          <va-card title="World">
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
      <div v-if="tabValue==1" class="flex md12 xs12">
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

      <div  v-if="tabValue==2" class="flex md12 xs12">
        <va-card :title="searchableSelectModel">
          <va-data-table
            :fields="ageFields"
            :data="arrayTableAge"
            no-pagination
            @click="star(props.rowData)"
          >
          </va-data-table>
        </va-card>
      </div>
      <div  class="flex md12 xs12" v-if="tabValue==3">
        <va-card
          class="chart-widget"
          :title="searchableSelectModel"
        >
          <va-chart :data="objectAgeRate" type="horizontal-bar"/>
        </va-card>
      </div>

    </div>
  </div>
</template>

<script>
import CoronaMap from './CoronaMaps'
import { serverBus } from '../../app/main'
import { hex2rgb } from '../../services/vuestic-ui'

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
        width: '14%',
      },
      {
        name: 'Confirmed',
        title: 'Confirmed',
        width: '14%',
      },
      {
        name: 'DayPerDay',
        title: 'Confirmed Day per Day',
        width: '12%',
      },
      {
        name: 'DayPerDayPercent',
        title: 'Confirmed % Day per Day',
        width: '12%',
      },
      {
        name: 'Deaths',
        title: 'Deaths',
        width: '12%',
      },
      {
        name: 'PercentOfDeaths',
        title: '% of Deaths',
        width: '12%',
        sortField: 'OrderPercentOfDeaths',

      },
      {
        name: 'Recovered',
        title: 'Recovered',
        width: '12%',
      },
      {
        name: 'PercentOfRecovered',
        title: '% of Recovered',
        width: '12%',
        sortField: 'OrderPercentOfRecovered',
      },
      {
        name: '__slot:actions',
        dataClass: 'text-right',
      },
      ]
    },
    ageFields () {
      return [{
        name: 'Nation',
        title: 'Nation',
        width: '10%',
      },
      {
        name: 'Confirmed',
        title: 'Confirmed',
        width: '10%',
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

      },
      {
        name: 'ExpectancyAge',
        title: 'Expectancy Age',
        width: '8%',
      },
      {
        name: 'MediumAge',
        title: 'Medium Age',
        width: '8%',
      },
      {
        name: 'R0_14',
        title: '0-14 years',
        width: '8%',
      },
      {
        name: 'R15_24',
        title: '15-24 years',
        width: '8%',
      },
      {
        name: 'R25_54',
        title: '25-54 years',
        width: '8%',
      },
      {
        name: 'R55_64',
        title: '55-64 years',
        width: '8%',
      },
      {
        name: 'R65_more',
        title: '65 - more years',
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
      hashAge: [],
      dateToShow: null,
      arrayDateToShow: [],
      arrayTable: [],
      arrayTableAge: [],
      confirmed: 0,
      recovered: 0,
      deaths: 0,
      objectAgeRate: {
        labels: [],
        datasets: [],
      },

    }
  },
  created () {
    serverBus.$on('progress', (objectFromMap) => {
      this.progress = objectFromMap.percent
      this.dateToShow = objectFromMap.date
    })
    this.getAge()
  },
  watch: {
    $route () {
      serverBus.$emit('stopItalyCron', null)
      this.getAge()
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
      const arrayDate = Object.keys(this.arrayDataNations.All).reverse()
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
      this.showDataTableAge()
    },
    showDataTable (date) {
      const indexDate = this.arrayDateToShow.indexOf(date)
      const arrayDate = Object.keys(this.arrayDataNations.All).reverse()
      const dateToShow = arrayDate[indexDate]
      let dateBeforeShow = dateToShow
      if (indexDate < arrayDate.length) dateBeforeShow = arrayDate[indexDate + 1]
      this.confirmed = this.arrayDataNations.All[dateToShow].Confirmed
      this.deaths = this.arrayDataNations.All[dateToShow].Deaths
      this.recovered = this.arrayDataNations.All[dateToShow].Recovered
      this.arrayTable = []
      const keyNation = Object.keys(this.arrayDataNations)
      for (let i = 0; i < keyNation.length; i++) {
        if (this.arrayDataNations[keyNation[i]][dateToShow] !== undefined && keyNation[i] !== 'All') {
          let delta = String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed)
          let dayPerDayPercent = '0.00'
          let sign = ''
          if (this.arrayDataNations[keyNation[i]][dateBeforeShow] !== undefined) {
            delta = String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed - this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed)
            dayPerDayPercent = (this.arrayDataNations[keyNation[i]][dateToShow].Confirmed - this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed) / this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed * 100
            dayPerDayPercent = dayPerDayPercent.toFixed(2)
          }
          const percentOfDeath = this.arrayDataNations[keyNation[i]][dateToShow].Deaths / this.arrayDataNations[keyNation[i]][dateToShow].Confirmed * 100
          const percentOfRecovered = this.arrayDataNations[keyNation[i]][dateToShow].Recovered / this.arrayDataNations[keyNation[i]][dateToShow].Confirmed * 100
          let orderPercentOfDeaths = ''
          let orderPercentOfRecovered = ''
          for (let i = 0; i < 10 - String(percentOfDeath).length; i++) orderPercentOfDeaths = '0' + orderPercentOfDeaths
          for (let i = 0; i < 10 - String(percentOfRecovered).length; i++) orderPercentOfRecovered = '0' + orderPercentOfRecovered

          if (dayPerDayPercent > 0) sign = '+'
          const objectOfData = {
            Nation: keyNation[i],
            Confirmed: String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed),
            Deaths: String(this.arrayDataNations[keyNation[i]][dateToShow].Deaths),
            PercentOfDeaths: percentOfDeath.toFixed(2) + '%',
            OrderPercentOfDeaths: orderPercentOfDeaths,
            Recovered: String(this.arrayDataNations[keyNation[i]][dateToShow].Recovered),
            PercentOfRecovered: percentOfRecovered.toFixed(2) + '%',
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

    showDataTableAge () {
      console.log('showDataTabelAge')
      const arrayDate = Object.keys(this.arrayDataNations.All).reverse()
      const latestDate = arrayDate[0]
      const indexDate = this.arrayDateToShow.indexOf(latestDate)
      const dateToShow = latestDate
      let dateBeforeShow = dateToShow
      if (indexDate < arrayDate.length) dateBeforeShow = arrayDate[indexDate + 1]
      this.arrayTableAge = []
      const keyNation = Object.keys(this.arrayDataNations)
      const arrayGraphMediumAge = []
      const arrayGraphDeathPercent = []
      const arrayGraphNation = []
      const arrayGraphConfirmed = []
      const arrayGraphRecoveredPercent = []
      for (let i = 0; i < keyNation.length; i++) {
        console.log('start' + keyNation[i])
        if (this.arrayDataNations[keyNation[i]][latestDate] !== undefined && keyNation[i] !== 'All') {
          let delta = String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed)
          let dayPerDayPercent = '0.00'
          let sign = ''
          if (this.arrayDataNations[keyNation[i]][dateBeforeShow] !== undefined) {
            delta = String(this.arrayDataNations[keyNation[i]][dateToShow].Confirmed - this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed)
            dayPerDayPercent = (this.arrayDataNations[keyNation[i]][dateToShow].Confirmed - this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed) / this.arrayDataNations[keyNation[i]][dateBeforeShow].Confirmed * 100
            dayPerDayPercent = dayPerDayPercent.toFixed(2)
          }
          const percentOfDeath = this.arrayDataNations[keyNation[i]][dateToShow].Deaths / this.arrayDataNations[keyNation[i]][dateToShow].Confirmed * 100
          const percentOfRecovered = this.arrayDataNations[keyNation[i]][dateToShow].Recovered / this.arrayDataNations[keyNation[i]][dateToShow].Confirmed * 100
          let orderPercentOfDeaths = ''
          let orderPercentOfRecovered = ''
          for (let i = 0; i < 10 - String(percentOfDeath).length; i++) orderPercentOfDeaths = '0' + orderPercentOfDeaths
          for (let i = 0; i < 10 - String(percentOfRecovered).length; i++) orderPercentOfRecovered = '0' + orderPercentOfRecovered
          if (dayPerDayPercent > 0) sign = '+'
          let R0_14 = 'N/A'
          let R15_24 = 'N/A'
          let R25_54 = 'N/A'
          let R55_64 = 'N/A'
          let R65More = 'N/A'
          let mediumAge = 'N/A'
          let expectancyAge = 'N/A'
          if (this.hashAge[keyNation[i]]) {
            console.log(this.hashAge[keyNation[i]])
            if (this.hashAge[keyNation[i]].rangeAge !== 'N/A') {
              R0_14 = this.hashAge[keyNation[i]].rangeAge.r0_14.percentage
              R15_24 = this.hashAge[keyNation[i]].rangeAge.r15_24.percentage
              R25_54 = this.hashAge[keyNation[i]].rangeAge.r25_54.percentage
              R55_64 = this.hashAge[keyNation[i]].rangeAge.r55_64.percentage
              R65More = this.hashAge[keyNation[i]].rangeAge.r65_more.percentage
            }
            if (this.hashAge[keyNation[i]].expectancyAge !== null) expectancyAge = this.hashAge[keyNation[i]].expectancyAge.toFixed(2)
            if (this.hashAge[keyNation[i]].mediumAge !== null) mediumAge = this.hashAge[keyNation[i]].mediumAge
          }
          if (mediumAge !== 'N/A' && this.arrayDataNations[keyNation[i]][latestDate].Deaths > 0) {
            mediumAge = this.hashAge[keyNation[i]].mediumAge
            arrayGraphNation.push(keyNation[i])
            arrayGraphMediumAge.push(mediumAge)
            arrayGraphDeathPercent.push(parseFloat(percentOfDeath.toFixed(2)))
            arrayGraphConfirmed.push((this.arrayDataNations[keyNation[i]][dateToShow].Confirmed / 1000).toFixed(2))
            arrayGraphRecoveredPercent.push(parseFloat(percentOfRecovered.toFixed(2)))
          }

          const objectOfData = {
            Nation: keyNation[i],
            Confirmed: this.arrayDataNations[keyNation[i]][dateToShow].Confirmed,
            Deaths: String(this.arrayDataNations[keyNation[i]][latestDate].Deaths),
            PercentOfDeaths: percentOfDeath.toFixed(2) + '%',
            OrderPercentOfDeaths: orderPercentOfDeaths,
            Recovered: String(this.arrayDataNations[keyNation[i]][latestDate].Recovered),
            PercentOfRecovered: percentOfRecovered.toFixed(2) + '%',
            OrderPercentOfRecovered: orderPercentOfRecovered,
            DayPerDay: delta,
            DayPerDayPercent: sign + dayPerDayPercent + '%',
            ExpectancyAge: expectancyAge,
            MediumAge: mediumAge,
            R0_14: R0_14 + '%',
            R15_24: R15_24 + '%',
            R25_54: R25_54 + '%',
            R55_64: R55_64 + '%',
            R65_more: R65More + '%',

          }
          this.arrayTableAge.push(objectOfData)
        }
        console.log('end' + keyNation[i])
      }
      console.log(arrayGraphNation)
      console.log(arrayGraphDeathPercent)
      console.log(arrayGraphMediumAge)
      this.objectAgeRate = {
        labels: arrayGraphNation,
        datasets: [
          {
            label: 'Confirmed (x1000)',
            backgroundColor: hex2rgb(this.$themes.warning, 1.0).css,
            borderColor: 'transparent',
            data: arrayGraphConfirmed,
          },
          {
            label: 'Deaths (%)',
            backgroundColor: hex2rgb(this.$themes.danger, 1.0).css,
            borderColor: 'transparent',
            data: arrayGraphDeathPercent,
          },
          {
            label: 'Recovered (%)',
            backgroundColor: hex2rgb(this.$themes.primary, 1.0).css,
            borderColor: 'transparent',
            data: arrayGraphRecoveredPercent,
          },
          {
            label: 'Medium Age (years)',
            backgroundColor: hex2rgb(this.$themes.info, 1.0).css,
            borderColor: 'transparent',
            data: arrayGraphMediumAge,
          },
        ],
      }
      console.log(this.objectAgeRate)
      this.arrayTableAge.sort(function (a, b) {
        return b.Confirmed - a.Confirmed
      })
      console.log('end age')
    },
    getAge () {
      axios
        .get('data/commons/dataAge.json')
        .then(response => {
          this.hashAge = response.data
          this.getDataNations()
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
