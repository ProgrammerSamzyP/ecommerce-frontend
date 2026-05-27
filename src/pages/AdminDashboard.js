import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [statusChartData, setStatusChartData] = useState(null);

  useEffect(() => {
    // Fetch summary statistics
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`)
      .then(res => {
        const data = res.data;
        setStats(data);
        // Prepare status chart data
        setStatusChartData({
          labels: ['Paid', 'Shipping', 'Delivered', 'Pending'],
          datasets: [
            {
              label: 'Orders by Status',
              data: [
                data.paidOrders,
                data.shippingOrders,
                data.deliveredOrders,
                data.pendingOrders,
              ],
              backgroundColor: [
                '#198754', // green
                '#0dcaf0', // cyan
                '#6610f2', // purple
                '#ffc107', // yellow
              ],
            },
          ],
        });
      })
      .catch(err => console.error(err));

    // Fetch daily revenue data
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin/revenue-daily`)
      .then(res => {
        const data = res.data;
        if (data && data.length > 0) {
          setRevenueData({
            labels: data.map(d => d.date),
            datasets: [
              {
                label: 'Daily Revenue (₦)',
                data: data.map(d => d.revenue),
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.3,
              },
            ],
          });
        } else {
          // No data yet
          setRevenueData({
            labels: ['No data'],
            datasets: [
              {
                label: 'Daily Revenue (₦)',
                data: [0],
                borderColor: '#0d6efd',
              },
            ],
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (!stats) {
    return (
      <div className="container mt-4">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <p className="card-text display-6">₦{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <p className="card-text display-6">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Paid / Shipping / Delivered</h5>
              <p className="card-text">
                {stats.paidOrders} / {stats.shippingOrders} / {stats.deliveredOrders}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Pending Orders</h5>
              <p className="card-text display-6">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mt-4">
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue Over Time</h5>
              {revenueData ? (
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: false },
                    },
                  }}
                />
              ) : (
                <p>Loading chart...</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Orders by Status</h5>
              {statusChartData ? (
                <Bar
                  data={statusChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                  }}
                />
              ) : (
                <p>Loading chart...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}