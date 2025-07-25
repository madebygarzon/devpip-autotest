"use client"

import { useEffect, useState } from "react"

export default function ReportViewer() {
  const [reportHtml, setReportHtml] = useState("")

  useEffect(() => {
    fetch("/reports/index.html")
      .then((res) => res.text())
      .then((html) => setReportHtml(html))
      .catch((err) => {
        console.error("Failed to load report:", err)
        setReportHtml("<p>Error loading report</p>")
      })
  }, [])

  return (
    <div
      className="w-full h-[80vh] overflow-auto bg-white rounded border"
      dangerouslySetInnerHTML={{ __html: reportHtml }}
    />
  )
}
