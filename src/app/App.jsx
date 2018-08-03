import React from 'react'
import { render } from 'react-dom'

import config from './config'
import charts from './charts'

import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import ConfigPanel from './components/ConfigPanel/ConfigPanel.jsx'
import ContextPoller from './components/ContextPoller.jsx'
import DatasetPoller from './components/DatasetPoller.jsx'

import { arrayMove } from 'react-sortable-hoc'
import 'semantic-ui-css/semantic.min.css'

class App extends React.Component {
  state = {
    // provided from ConfigPanel
    host: {
      // 100.118.181.46
      // localhost
      hostname: '100.118.181.46',
      hostspec: 'localhost'
    },
    settings: {
      containerFilter: '_all',
      windowSeconds: 120,
      intervalSeconds: 2
    },
    chartlist: [ ],
    containerList: [],
    contextData: [],
  }

  onContainerListLoaded = (containerList) => this.setState({ containerList })
  onClearCharts = () => this.setState({ chartlist: [] })
  onAddChart = (chart) => {
    this.setState((oldState) => ({ chartlist: [ ...oldState.chartlist, chart ] }))
  }

  removeChartByIndex = (idx) => {
    console.log('removing chart at index ', idx)
    this.setState((oldState) =>
      ({ chartlist: [ ...oldState.chartlist.slice(0, idx), ...oldState.chartlist.slice(idx + 1) ] })
    )
  }

  updateChartSettings = (idx, settings) => {
    this.setState((oldState) => {
      let newChart = { ...oldState.chartlist[idx], ...settings }
      return { chartlist: [ ...oldState.chartlist.slice(0, idx), newChart, ...oldState.chartlist.slice(idx + 1) ] }
    })
  }

  onMoveChart = (oldIndex, newIndex) => {
    this.setState((oldState) => ({
      chartlist: arrayMove(oldState.chartlist, oldIndex, newIndex)
    }))
  }

  onContextUpdated = (context) => {
    this.setState(() => {
      // TODO should actually update the context not just replace it
      console.log('context updated', context)
      return { contextData: [ context ] }
    })
  }

  onContextDatasetUpdated = (ctxds) => {
    console.log('ctxds updated', ctxds)
  }

  render () {
    return (
      <div>
        <div className="col-md-12">
          <ContextPoller
            pollIntervalMs={5000}
            targets={[ { hostname: '100.118.181.46', hostspec: 'localhost', containerId: null } ]}
            onContextUpdated={this.onContextUpdated} />

          <DatasetPoller
            pollIntervalMs={2000}
            charts={ (this.state.contextData && this.state.chartlist)
              ? this.state.chartlist.map(c => ({ context: this.state.contextData[0], ...c }))
              : []
            }
            windowIntervalMs={120000}
            contextData={this.state.contextData}
            onContextDatasetUpdated={this.onContextDatasetUpdated} />

          <Navbar embed={false} />

          <ConfigPanel
            onHostDataChanged={(h) => this.setState({ host: h })}
            onSettingsChanged={(s) => this.setState({ settings: s })}
            onClearCharts={this.onClearCharts}
            onAddChart={this.onAddChart}
            containerList={this.state.containerList}
            charts={charts}
            windows={config.windows}
            intervals={config.intervals}
            hostname={'100.118.181.46'}
            hostspec={'localhost'}
            windowSeconds={120}
            intervalSeconds={2}
            containerFilter={'_all'}/>

          <Dashboard
            host={this.state.host}
            settings={this.state.settings}
            chartlist={this.state.chartlist}
            onContainerListLoaded={this.onContainerListLoaded}
            removeChartByIndex={this.removeChartByIndex}
            updateChartSettings={this.updateChartSettings}
            onMoveChart={this.onMoveChart} />

          <Footer version={config.version}/>
        </div>
      </div>
    )
  }
}

App.propTypes = {
}

render(<App/>, document.getElementById('app'))
