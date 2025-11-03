const DashboardEmbed = () => {
  const API_TOKEN = 'eyJrIjoiWG1KQmdURDhpT1lnWEdneVNIMVVaODJ0R1FKVTdBajkiLCJuIjoicmN2IiwiaWQiOjF9'
  const DASHBOARD_UID = 'd78cb9fd-657a-4eed-adf9-63f1be3df8ce'
  const GRAFANA_URL = 'http://172.16.0.95:3000'

  const iframeUrl = `http://172.16.0.95:3000/d/d78cb9fd-657a-4eed-adf9-63f1be3df8ce/connection-server-health-status?orgId=1&refresh=30s&from=1704882820493&to=1704883120493&token=${API_TOKEN}`
//   http://172.16.0.95:3000/d/d78cb9fd-657a-4eed-adf9-63f1be3df8ce/connection-server-health-status?orgId=1&refresh=30s&from=1704882820493&to=1704883120493
// `${GRAFANA_URL}/d/${DASHBOARD_UID}?orgId=1&from=now-7d&to=now&theme=light&token=${API_TOKEN}`

  return (
    <div>
      <iframe
        title="Grafana Dashboard"
        width="100%"
        height="600"
        src={iframeUrl}
        // frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default DashboardEmbed;
