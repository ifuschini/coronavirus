<template>
  <div class="bubble-map fill-height" />
</template>

<script>
import axios from 'axios'
import { serverBus } from '../../app/main'

import 'amcharts3'
import 'amcharts3/amcharts/plugins/responsive/responsive.js'
import 'amcharts3/amcharts/serial.js'
import 'amcharts3/amcharts/themes/light'

import 'ammap3'
import 'ammap3/ammap/maps/js/worldLow'

export default {
  name: 'corona-map',
  components: {
    // BubbleMap
  },
  data () {
    return {
      coordinates: null,
      arrayDataNations: null,
      arrayDatesAvailable: null,
      listDatesAvailable: [],
      mapData: null,
      cronCheck: null,
      count: 0,
      latestStringDate: '',
    }
  },
  methods: {
    normalizeData (action = null) {
      this.arrayDatesAvailable = Object.keys(this.arrayDataNations.All)
      const keysNationAvailable = Object.keys(this.arrayDataNations)
      if (this.count === this.arrayDatesAvailable.length) this.count = 0
      // let lastDate=this. arrayDatesAvailable[this. arrayDatesAvailable.length- 1]
      if (action === 'backward') { this.count = 0 }
      if (action === 'forward') { this.count = this.arrayDatesAvailable.length - 1 }
      const lastDate = this.arrayDatesAvailable[this.count]
      this.latestStringDate = lastDate.substring(6) + '/' + lastDate.substring(4, 6) + '/' + lastDate.substring(0, 4)
      const arrayData = []
      for (let i = 0; i < keysNationAvailable.length; i++) {
        const nationName = keysNationAvailable[i]
        let dataObj = {}
        if (this.arrayDataNations[nationName][lastDate] !== undefined && nationName !== 'All') {
          dataObj = {
            code: nationName,
            name: nationName,
            value: this.arrayDataNations[nationName][lastDate].Confirmed,
            color: '#eea638',
          }
          arrayData.push(dataObj)
        }
      }
      this.mapData = {
        data: arrayData,
        latlong: this.coordinates,
      }
      // this.mapData=this.bubbleMapData
      this.drawMap()
      serverBus.$emit('progress', {
        percent: this.count / this.arrayDatesAvailable.length * 100,
        date: this.latestStringDate,
      })
      this.count = this.count + 1
    },
    getDataNations () {
      axios
        .get('data/commons/nationsData.json')
        .then(response => {
          this.arrayDataNations = response.data
          this.getDataCoorinates()
        })
        .catch(e => {
          this.error = e
        })
    },
    getDataCoorinates () {
      axios
        .get('data/commons/bubbleData.json')
        .then(response => {
          this.coordinates = response.data
          this.startCron()
        })
        .catch(e => {
          this.error = e
        })
    },
    drawMap () {
      /* global AmCharts */
      const minBulletSize = 3
      const maxBulletSize = 70
      let min = Infinity
      let max = -Infinity
      AmCharts.theme = AmCharts.themes.light

      // get min and max values
      this.mapData.data.forEach((dataItem) => {
        const value = dataItem.value
        if (value < min) {
          min = value
        }
        if (value > max) {
          max = value
        }
      })

      // build map
      const map = new AmCharts.AmMap()

      map.projection = 'winkel3'
      map.addTitle('Coronavirus COVID-19', 14, 1, 1, false)
      map.addTitle('source: arcgis.com', 11, 1, 1, 1, false)
      map.zoomControl = {
        homeButtonEnabled: false,
        zoomControlEnabled: false,
        panControlEnabled: false,
      }
      map.areasSettings = {
        unlistedAreasColor: '#eee',
        unlistedAreasAlpha: 1,
        outlineColor: '#fff',
        outlineThickness: 2,
      }
      map.imagesSettings = {
        balloonText: '<span style="font-size:14px"><b>[[title]]</b>: [[value]]</span>',
        alpha: 0.75,
      }

      const dataProvider = {
        mapVar: AmCharts.maps.worldLow,
        images: [],
      }

      // create circle for each country
      // it's better to use circle square to show difference between values, not a radius
      const maxSquare = maxBulletSize * maxBulletSize * 2 * Math.PI
      const minSquare = minBulletSize * minBulletSize * 2 * Math.PI

      // create circle for each country
      this.mapData.data.forEach((dataItem) => {
        // console.log(dataItem)
        const value = dataItem.value
        // calculate size of a bubble
        let square = (value - min) / (max - min) * (maxSquare - minSquare) + minSquare
        if (square < minSquare) {
          square = minSquare
        }
        const size = Math.sqrt(square / (Math.PI * 2))
        if (dataItem.code !== undefined) {
          const id = dataItem.code
          if (this.mapData.latlong[id] !== undefined) {
            dataProvider.images.push({
              type: 'circle',
              width: size,
              height: size,
              color: dataItem.color,
              longitude: this.mapData.latlong[id].longitude,
              latitude: this.mapData.latlong[id].latitude,
              title: dataItem.name,
              value: value,
            })
          }
        }
      })
      map.dataProvider = dataProvider
      map.write(this.$el)
    },
    startCron () {
      console.log('start cron')
      this.normalizeData()
      if (this.cronCheck === null) {
        this.cronCheck = setInterval(function () {
          this.normalizeData()
        }.bind(this), 1000)
      }
    },

  },
  created () {
    serverBus.$on('stopCron', (action) => {
      clearTimeout(this.cronCheck)
      this.cronCheck = null
    })
    serverBus.$on('playerAction', (action) => {
      console.log('action:' + action)
      if (action === 'play') {
        this.startCron()
      } else if (action === 'pause') {
        clearTimeout(this.cronCheck)
        this.cronCheck = null
      } else {
        clearTimeout(this.cronCheck)
        this.cronCheck = null
        this.normalizeData(action)
      }
    })
  },
  mounted () {
    console.log('idelio')
    console.log(this.bubbleMapData)
    this.getDataNations()
    // this.drawMap()
  },

}
</script>
