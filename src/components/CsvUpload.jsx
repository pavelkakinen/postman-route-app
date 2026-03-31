import { useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

function parseRows(rows) {
  return rows
    .filter(row => row.address)
    .map(row => ({
      address: String(row.address).trim(),
      newspaper: String(row.newspaper || '').trim(),
    }))
}

export default function CsvUpload({ onStopsLoaded }) {
  const inputRef = useRef()

  function parseFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        onStopsLoaded(parseRows(rows))
      }
      reader.readAsArrayBuffer(file)
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          onStopsLoaded(parseRows(results.data))
        },
      })
    }
  }

  function handleChange(e) {
    parseFile(e.target.files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    parseFile(e.dataTransfer.files[0])
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  return (
    <div
      className="csv-upload"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <p>Drop a file here or click to upload</p>
      <p className="csv-hint">Accepts <code>.xlsx</code> or <code>.csv</code> — columns: <code>address</code>, <code>newspaper</code></p>
    </div>
  )
}
