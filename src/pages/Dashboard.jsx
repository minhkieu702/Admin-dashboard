import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Profile from '../components/Profile';
import { getRole } from '../services/helper';
import Analytics from '../components/Analytics';
import Bookings from './booking';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  console.log(getRole());
  
  if (getRole() == 1) {
    return (
      <Profile/>
    ); 
  }
  if (getRole() == 2) {
    return(
      <Analytics/>
    )
  }
};

export default Dashboard; 