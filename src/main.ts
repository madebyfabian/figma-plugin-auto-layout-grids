const localGridStyles = figma.getLocalGridStyles()

const typesValues = {
  'Grid': '(Default) Grid',
  'Columns': '(Default) Columns',
  'Rows': '(Default) Rows',
}

let grids

// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ( parameters: ParameterValues, currentKey: string, result: SuggestionResults ) => {
  // Search for grids or gridIds on any frame in the current page
  grids = searchForGrids()

  const query = parameters[currentKey]
  switch (currentKey) {
    case 'type':
      const types = [
        ...Object.values(typesValues),
        ...localGridStyles.map(gridStyle => gridStyle.name),
        ...grids.map(grid => grid.name)
      ]
      // @ts-ignore
      result.setSuggestions(types.filter(s => s.includes(query)))
      break
    default:
      return
  }
})

figma.on('run', ({ parameters }: RunEvent) => {
  if (parameters) 
    startPluginWithParameters(parameters)
})

const startPluginWithParameters = (parameters: ParameterValues) => {
  const selection = figma.currentPage.selection

  if (selection.length === 0)
    return notifyAndClosePlugin({ message: 'Please select at least one frame! 😊' })

  selection.forEach(node => {
    if (node.type !== 'FRAME')
      return 

    if (node.gridStyleId || node.layoutGrids.length)
      return notifyAndClosePlugin({ message: 'Layout grids already exist on this frame 💪🏻' })

    switch (parameters['type']) {
      case typesValues.Grid: {
        const newGrid: GridLayoutGrid = {
          pattern: 'GRID',
          sectionSize: 8,
          ...newLayoutGridDefaults,
        }

        node.layoutGrids = [ newGrid ]
        break
      }
    
      case typesValues.Columns: {
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

      case typesValues.Rows: {
        const newGrid: RowsColsLayoutGrid = {
          pattern: "ROWS",
          alignment: "STRETCH",
          count: 5,
          gutterSize: 20,
          offset: 0,
          ...newLayoutGridDefaults,
        }

        node.layoutGrids = [ newGrid ]
        break
      }

      default: {
        const foundGridData = grids.find(grid => grid.name === parameters['type'])
        if (foundGridData.gridStyleId) 
          node.gridStyleId = foundGridData.gridStyleId
        else
          node.layoutGrids = foundGridData.layoutGrids

        break
      }
    }
  })

  figma.closePlugin()
}

const searchForGrids = () => {
  const grids = []

  figma.currentPage.findAll(node => {
    const gridStyleId = node['gridStyleId'],
          layoutGrids = node['layoutGrids']

    if (!(gridStyleId || layoutGrids?.length))
      return false

    // Check if already in the list, if not, push
    if (!grids.find(grid => grid.id === gridStyleId || JSON.stringify(grid.layoutGrids) === JSON.stringify(layoutGrids))) {
      grids.push({ name: `Copy grid from "${node.name}"`, gridStyleId, layoutGrids })
    }
  })

  return grids
}

const newLayoutGridDefaults = {
  visible: true,
  color: { r: 1, g: 0, b: 0, a: 0.1 },
}

const notifyAndClosePlugin = ({ message }) => {
  figma.notify(message)
  figma.closePlugin()
}