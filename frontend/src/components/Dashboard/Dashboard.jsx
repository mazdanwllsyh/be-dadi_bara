import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaUserEdit, FaUsers, FaUserFriends } from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  BarElement,
  Title,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import instance from "../../utils/axios.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalUsers: 0,
    totalPengurus: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get("/auth/stats", {
          withCredentials: true,
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    };
    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'SF UI Text', 'SF UI Display', 'Roboto', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: "Visualisasi Data Akun Pengguna",
        font: {
          size: 21,
          family: "'SF UI Display', 'SF UI Text', 'Roboto', sans-serif",
        },
      },
      tooltip: {
        bodyFont: {
          family: "'SF UI Text', 'SF UI Display', 'Roboto', sans-serif",
        },
        titleFont: {
          family: "'SF UI Display', 'SF UI Text', 'Roboto', sans-serif",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          font: {
            family: "'SF UI Text', 'SF UI Display', 'Roboto', sans-serif",
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: "'SF UI Text', 'SF UI Display', 'Roboto', sans-serif",
          },
        },
      },
    },
  };

  const chartData = {
    labels: ["Admin", "Super Admin", "User", "Pengurus"],
    datasets: [
      {
        label: "Jumlah",
        data: [
          dashboardData.totalAdmins,
          dashboardData.totalSuperAdmins,
          dashboardData.totalUsers,
          dashboardData.totalPengurus,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.65)",
          "rgba(54, 162, 235, 0.65)",
          "rgba(255, 206, 86, 0.65)",
          "rgba(75, 192, 192, 0.65)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container className="dashboard-container my-3">
      <Row>
        <Col>
          <h2 className="section-title mb-4">Dashboard</h2>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Link
            to="/admin/data-admin"
            className="dashboard-card-link text-decoration-none"
          >
            <Card>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="text-custom fw-bold">
                    {dashboardData.totalAdmins}
                  </h2>
                  <h5 className="text-custom fw-bold">Admin</h5>
                </div>
                <FaUserEdit size={50} />
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} className="mb-4">
          <Link
            to="/admin/data-admin"
            className="dashboard-card-link text-decoration-none"
          >
            <Card>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="text-custom fw-bold">
                    {dashboardData.totalSuperAdmins}
                  </h2>
                  <h5 className="text-custom fw-bold">Super Admin</h5>
                </div>
                <FaUserGear size={50} />
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Link
            to="/admin/data-user"
            className="dashboard-card-link text-decoration-none"
          >
            <Card>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="text-custom fw-bold">
                    {dashboardData.totalUsers}
                  </h2>
                  <h5 className="text-custom fw-bold">Total User</h5>
                </div>
                <FaUserFriends size={50} />
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} className="mb-4">
          <Link
            to="/admin/keanggotaan"
            className="dashboard-card-link text-decoration-none"
          >
            <Card>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="text-custom fw-bold">
                    {dashboardData.totalPengurus}
                  </h2>
                  <h5 className="text-custom fw-bold">Pengurus</h5>
                </div>
                <FaUsers size={50} />
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "auto",
                }}
              >
                <Bar options={chartOptions} data={chartData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
