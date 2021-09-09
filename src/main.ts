// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ( parameters: ParameterValues, currentKey: string, result: SuggestionResults ) => {
  const query = parameters[currentKey]
  switch (currentKey) {
    case 'type':
      const types = ['Grid', 'Columns', 'Rows']
      result.setSuggestions(types.filter(s => s.includes(query)))
      break
    default:
      return
  }
})

// When the user presses Enter after inputting all parameters, the 'run' event is fired.
// @ts-ignore
figma.on('run', ({parameters}: RunEvent) => {
  if (parameters) {
    startPluginWithParameters(parameters)
  }
})

const startPluginWithParameters = (parameters: ParameterValues) => {
  const selection = figma.currentPage.selection

  

  selection.forEach(node => {
    if (node.type !== 'FRAME')
      return 

    if (node.gridStyleId || node.layoutGrids.length) {
      figma.notify('Layout grids already exist on this frame.')
      return figma.closePlugin()
    }

    switch (parameters['type']) {
      case 'Grid': {
        const newGrid: GridLayoutGrid = {
          pattern: 'GRID',
          sectionSize: 8,
          ...newLayoutGridDefaults,
        }

        node.layoutGrids = [ newGrid ]
        break
      }
    
      case 'Columns': {
        const newGrid: RowsColsLayoutGrid = {
          pattern: "COLUMNS",
          alignment: "STRETCH",
          count: 5,
          gutterSize: 20,
          offset: 0,
          ...newLayoutGridDefaults,
        }

        node.layoutGrids = [ newGrid ]
        break
      }
    }

    

  })

  figma.closePlugin()
}

const newLayoutGridDefaults = {
  visible: true,
  color: { r: 1, g: 0, b: 0, a: 0.1 },
}