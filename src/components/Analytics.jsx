import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axiosInstance from '../services/axiosConfig';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [artist, setArtist]= useState([])
  const [design, setDesign]= useState([])
  const [payment, setPayment]= useState([])
  
  // const revenueData = {
  //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  //   datasets: [
  //     {
  //       label: 'Revenue',
  //       data: [3000, 4500, 3500, 5000, 6000, 7500],
  //       fill: false,
  //       borderColor: 'rgb(75, 192, 192)',
  //       tension: 0.1,
  //     },
  //   ],
  // };


  const monthlyRevenueMap = {};

payment.forEach(order => {
  if (order.Status === "1") {
    const month = dayjs(order.CreatedAt).format('MMM'); // 'Jan', 'Feb', ...
    if (!monthlyRevenueMap[month]) {
      monthlyRevenueMap[month] = 0;
    }
    monthlyRevenueMap[month] += order.TotalAmount
  }
});
const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const labels = monthOrder.filter(m => monthlyRevenueMap[m] !== undefined);
const data = labels.map(m => monthlyRevenueMap[m]);

const revenueData = {
  labels,
  datasets: [
    {
      label: 'Revenue',
      data,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

  // const serviceData = {
  //   labels: ['Manicure', 'Pedicure', 'Nail Art', 'Acrylic', 'Gel Polish', 'Waxing'],
  //   datasets: [
  //     {
  //       label: 'Number of Services',
  //       data: [120, 90, 75, 85, 95, 40],
  //       backgroundColor: [
  //         'rgba(255, 99, 132, 0.5)',
  //         'rgba(54, 162, 235, 0.5)',
  //         'rgba(255, 206, 86, 0.5)',
  //         'rgba(75, 192, 192, 0.5)',
  //         'rgba(153, 102, 255, 0.5)',
  //         'rgba(255, 159, 64, 0.5)',
  //       ],
  //       borderColor: [
  //         'rgba(255, 99, 132, 1)',
  //         'rgba(54, 162, 235, 1)',
  //         'rgba(255, 206, 86, 1)',
  //         'rgba(75, 192, 192, 1)',
  //         'rgba(153, 102, 255, 1)',
  //         'rgba(255, 159, 64, 1)',
  //       ],
  //       borderWidth: 1,
  //     },
  //   ],
  // };
  const filteredData = design.filter(item => item.TotalBookingCount > 0);
  const serviceData = {
    labels: filteredData.map(item => item.Name),
    datasets: [
      {
        data: filteredData.map(item => item.TotalBookingCount),
        backgroundColor: filteredData.map((_, index) =>
          `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 120) % 255}, 0.5)`
        ),
        borderColor: filteredData.map((_, index) =>
          `rgba(${(index * 50) % 255}, ${(index * 80) % 255}, ${(index * 120) % 255}, 1)`
        ),
        borderWidth: 1,
      },
    ],
  };



  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  useEffect(()=>{
    const getAllArtist = async ()=>{
      try {
        const res = await axiosInstance.get(`/odata/artist?$select=id,username,totalBookingCount&$expand=user($select=fullName)`)
        setArtist(res.value)
      } catch (error) {
        console.log(error)
      }
    }
    getAllArtist()
  },[])
  useEffect(()=>{
    const getDesign = async ()=>{
      try {
        const res = await axiosInstance.get(`/odata/design?$select=id,name,totalBookingCount
`)
setDesign(res.value)

      } catch (error) {
        console.log(error)
      }
    }
    getDesign()
    
  },[])
  useEffect(()=>{
    const getPayment = async ()=>{
      const res = await axiosInstance.get(`/odata/Payment?$select=status,id,totalamount,createdAt`)
      setPayment(res.value)
    }
    getPayment()
  },[])
  

  const bookingsByArtist = {};

artist.forEach(item => {
  const name = item.User.FullName || item.Username;
  if (!bookingsByArtist[name]) {
    bookingsByArtist[name] = 0;
  }
  bookingsByArtist[name] += item.TotalBookingCount;
  
});
const artistPerformanceData = {
  labels: Object.keys(bookingsByArtist),
  datasets: [
    {
      data: Object.values(bookingsByArtist),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
    },
  ],
};
const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false, // Tắt label “Number of Bookings”
    },
  },
};


  

  return (
    <Container fluid>
    

      <Row>
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Revenue Overview</h5>
            </Card.Header>
            <Card.Body>
              <Line options={chartOptions} data={revenueData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Artist Workload Distribution</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut data={artistPerformanceData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Popular Services</h5>
            </Card.Header>
            <Card.Body>
            <Bar data={serviceData} options={options} />

            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default Analytics; 