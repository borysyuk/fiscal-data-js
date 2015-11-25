# Fiscal Data JS

## Overview

Fiscal Data JS is a small data layer for creating views on fiscal data in the browser.

[We are working on requirements here](REQUIREMENTS.md), as well as actively developing this library right now as part of the [Fiscal Data Package Viewer](https://github.com/openspending/fiscal-data-package-viewer).

## Getting started

Install the `fiscalData` library.

`npm install fiscalData` [Currently, only install from GitHub]

Use it in your code.

```
// Using the default .csv loader
import fiscalData from 'fiscalData'

const dataSource = 'http://some.url'
const options = { format: 'csv', ...etc }

const { store, actions } = fiscalData

// Use store.dispatch to send actions and update state
store.dispatch(actions.initialiseStateTreeIfNeeded(dataSource, options))

// Use store.subscribe to listen on changes
store.subscribe(() => {
  console.log(store.getState())
});

// Using Redux React bindings, you probably won't call subscribe directly
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { myAction } from './actions'

class MyComponent extends Component {
  componentDidMount() {
    const { dispatch } = this.props
    dispatch(myAction())
  }
  render() {
    const { data } = this.props
    return <div>// etc.</div>
  }
}
function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps)(MyComponent)
```

## Dev Server

`npm run develop`

This will build and run a dev server at

`http://127.0.0.1:8080/webpack-dev-server/`

And read from an `index.html` file at the root of the app. See more about the [`webpack-dev-server`](https://webpack.github.io/docs/webpack-dev-server.html), and see the minimal example file `index.example.html`

## API

`fiscalData` is a light wrapper around redux, a "...predictable state container for JavaScript apps". [Read more about Redux](http://rackt.org/redux/).

For specifics on the `fiscalData` API, see the [test suite](test/) and the [Fiscal Data Package Viewer](https://github.com/openspending/fiscal-data-package-viewer), which implements a view layer on top of `fiscalData`.

More documentation to come :).
