# Fiscal Data JS

## Overview

Fiscal Data JS is a small data layer for creating views on fiscal data in the browser.

The goal is to provide a small API for reading lines of fiscal data, for indicating the measures and dimensions in that data, and for initialising and updating the state tree that holds the data.

Fiscal Data JS does not provide any views on the data itself. Views (e.g.: visulisations such as treemaps and bubblecharts) should be provided as 3rd party packages that are compatible with the Fiscal Data JS API.

## Why?

We have [`openspendingjs`](https://github.com/openspending/openspendingjs), and a plethora of visualisations of fiscal data across a range of projects in the OpenSpending ecosystem and beyond. So, we do we need Fiscal Data JS?

Fiscal Data JS aims to be the basis of a more modular ecosystem of visualisation tools for fiscal data in Javascript, providing:

1. A clear and simple API for data access based on `measures` and `dimensions`.
2. A firm distinction between data access and views on that data (visualisations).
3. A mapping interface to support a number of data sources (CSV, Fiscal Data Package, OpenSpending API, SpenDB API).

### OpenSpending ecosystem

In some ways, Fiscal Data JS is designed as a successor to [`openspendingjs`](https://github.com/openspending/openspendingjs), but one designed for the [OpenSpending Next](http://community.openspending.org/next/) ecosystem.

A core design principle of OpenSpending Next is a componentised platform with a range of entry points into the platform itself, and to the data that the platform stores.

On a very practical level, OpenSpending Next exposes data via at least two APIs:

1. Directly from Fiscal Data Packages served out of the OpenSpending Datastore.
2. Via a dedicated API for querying data across datasets.

Fiscal Data JS will enable us to maximize reuse of code and libraries for data views over these and other data sources.

### Beyond OpenSpending

Fiscal Data JS is not tied to OpenSpending in any way (which is also true for many of the tools and specifications in the OpenSpending ecosystem).

By providing a layer for data access that is not intrinsically tied to a particular source of data, nor to a fixed set of views on the data, Fiscal Data JS aims to be generally useful.

## Use cases

We'd expect Fiscal Data JS to enable the following use cases:

* Iteration over lines of budget and spend data via a loosely consistent data structure (loosely consistent would mean we'd expect a certain minimal set of fields, but not limit the data structure to those fields)
* Display code lists that have been extracted from the data. Code lists can apply for measures and dimensions. An example code list derived from dimensions would be a list of years that are represented by the fiscal lines. An example code list derived from measures would be a list of [phases](http://fiscal.dataprotocols.org/spec/#details) in a budget process represented by the fiscal lines.
* Extract labels and description field(s) for each fiscal line
* Update the state tree based on user interactions. For example, update by filtering/grouping/summing data on dimensions and properties of measures.
* Provide access to previous states of the data, allowing easy navigation back and forth across views.
* Provide the ability to store UI state information with the state of the data.

## Requirements

### Expected data

Fiscal Data JS expects a minimum set of fields in a dataset.

#### Measures

In Fiscal Data JS, measures are monetary amounts, and while there can be multiple measures on a given fiscal line, we *require* one.

#### Dimensions

In Fiscal Data JS, dimensions are contextual data for the measures in a fiscal line, and are often used to filter visible lines, and to sum measures. A range of common dimensions for fiscal data can be found in the [Fiscal Data Package](http://fiscal.dataprotocols.org/spec/) specification.

No dimensions are required, but views on fiscal data would be more useful with at least one dimension.

#### Additional fields

As yet undefined, but we'd support the types of measures and dimensions declared in [Fiscal Data Package](http://fiscal.dataprotocols.org/spec/), and expect to provide value in further iterations on the library based on knowing the types of measures and dimensions we can expect in fiscal data.

### Components

Fiscal Data JS has the following components: data source mappers, a state tree, a set of functions that make up an API for populating and updating the state tree.

#### Data source mappers

A data source mapper takes a data source, and maps it into the data structure for raw data in the Fiscal Data JS state tree.

We expect to include data mappers for:

* A single CSV file
* A Fiscal Data Package

Work on these data source mappers will expose a reproducible pattern for custom implementations.

For example, a data source mapper for a single CSV file would transform this:

```
data.csv
amount,year,category
10,2010,Education
20,2011,Education
30,2012,Education
40,2013,Education
50,2014,Education
100,2010,Arts
200,2011,Arts
300,2012,Arts
400,2013,Arts
500,2014,Arts
```

into something like this:

```
{
  "model": {
    "measures": {
      "amount": {
        "currency": "AUD"
      }
    },
    "dimensions": {
      "category": {
        "type": "functional"
      },
      "year": {
        "type": "date"
      }
    }
  },
  "data": {
    "results": [
      {"amount": 10, "year": 2010, "category": "Education"},
      {"amount": 20, "year": 2011, "category": "Education"},
      {"amount": 30, "year": 2012, "category": "Education"},
      {"amount": 40, "year": 2013, "category": "Education"},
      {"amount": 50, "year": 2014, "category": "Education"},
      {"amount": 100, "year": 2010, "category": "Arts"},
      {"amount": 200, "year": 2011, "category": "Arts"},
      {"amount": 300, "year": 2012, "category": "Arts"},
      {"amount": 400, "year": 2013, "category": "Arts"},
      {"amount": 500, "year": 2014, "category": "Arts"}
    ],
    "codeLists": {
      "measures": {},
      "dimensions": {
        "category": ["Education", "Arts"],
        "year": [2010, 2011, 2012, 2013, 2014]
      }
    }
  }
}
```

#### State tree

As shown above, the state tree holds the current state of data. It would likely have properties like:

* model: Holds info on the model. Probably populated on init of data from data source, and does not need to change
* data: Holds the data that is accessed from the view layer. Data results would update based on user interaction. Also holds code lists that will be used in the user interface, and also likely some type of history of data state
* ui: store ui state that corresponds to a data state

#### API

A set of functions and hooks that expose the following functionality:

* initialise the state tree from a data source
* update the state tree from a data source
* read the data, the model and the code lists from the state tree
* write ui state to the state tree
* access the history of the state tree (user navigation)
* populate the state tree from a set of parameters (i.e.: view layer gets arguments to the URL, and uses them to build a view on the data)

The API of Fiscal Data JS is about managing the state of the data used by a view layer. It is not concerned at all with the view layer itself.

## Implementation

I'm currently very partial to using [Redux](http://redux.js.org) to implement this, and I've started on a small prototype using it.

The functional programming paradigm and focus on immutable state management make it an ideal candidate for the limited API that Fiscal Data JS would expose, which is essentially about managing transitions in state. [Unidirectional data flow](http://redux.js.org/docs/basics/DataFlow.html) is easy to reason about, and straightforward to debug.

This would not impose any particular pattern on consumers of the library, who would simply interact with the exposes APIs which do not dictate anything about the view layer whatsoever.
