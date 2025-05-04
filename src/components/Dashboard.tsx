import React, { useState, useEffect, useMemo } from 'react';
import { departments } from '../data';
import { Users, Building2, AlertTriangle, FileText, UserPlus, UserMinus } from 'lucide-react';
import EmployeeList from './EmployeeList';
import SmartSearchBar from './ui/SmartSearchBar';
import { motion } from 'framer-motion';
import { FadeSlideUp, staggerContainer, fadeSlideCard, PageTransition } from './ui/MotionWrappers';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useEmployees } from '../context/EmployeeContext';
import { useAuth } from '../context/AuthContext';
import type { Employee } from '../types/employees';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { employeeDetails } = useAuth();
  const { employees } = useEmployees();
  const navigate = useNavigate();

  const handleViewEmployee = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    availableEmployees: employees.filter(emp => emp.status === 'active' && !emp.position).length,
    totalDepartments: departments.length,
    expiringVisas: employees.filter(emp => emp.visaExpiryDate && calculateDaysRemaining(emp.visaExpiryDate) < 30 && calculateDaysRemaining(emp.visaExpiryDate) >= 0).length,
    missingDocuments: employees.filter(emp => !emp.documents || emp.documents.length === 0).length,
  });

  // Calculate stats from employees data
  const calculateStats = useMemo(() => {
    return {
      totalEmployees: employees?.length || 0,
      activeEmployees: employees?.filter(emp => emp?.status === 'active').length || 0,
      availableEmployees: employees?.filter(emp => emp?.status === 'active' && !emp?.position).length || 0,
      totalDepartments: departments.length,
      expiringVisas: employees?.filter(emp => 
        emp?.visaExpiryDate && 
        calculateDaysRemaining(emp.visaExpiryDate) < 30 && 
        calculateDaysRemaining(emp.visaExpiryDate) >= 0
      ).length || 0,
      missingDocuments: employees?.filter(emp => !emp?.documents || emp.documents.length === 0).length || 0,
    };
  }, [employees, departments]);

  // Update stats when employees or departments change
  useEffect(() => {
    setStats(calculateStats);
  }, [calculateStats]);

  // Refresh stats every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(calculateStats);
    }, 60000);
    return () => clearInterval(interval);
  }, [calculateStats]);

  const getVisaStatusTag = (expiryDate: string | undefined) => {
    if (!expiryDate) return null;
    const days = calculateDaysRemaining(expiryDate);
    if (days < 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold ml-2"> Expired</span>;
    if (days < 30) return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold ml-2"> Expiring Soon</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold ml-2"> Valid</span>;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return 'Invalid Date';
    }
  };

  const calculateDaysRemaining = (expiryDateString: string | undefined): number => {
    if (!expiryDateString) return 0;
    try {
      const expiryDate = new Date(expiryDateString);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error("Invalid date format:", expiryDateString);
      return 0;
    }
  };

  // --- Analytics Data Preparation ---
  // 1. Employees by company (Pie Chart)
  const companyCounts = employees.reduce((acc: Record<string, number>, emp: Employee) => {
    acc[emp.companyName] = (acc[emp.companyName] || 0) + 1;
    return acc;
  }, {});
  const companyPieData = Object.entries(companyCounts).map(([name, value], idx) => ({
    name,
    value,
    color: ['#DD1A51', '#F59E42', '#3B82F6', '#10B981', '#FBBF24'][idx % 5]
  }));

  // 2. Visa expiry analytics (Bar Chart)
  const today = new Date();
  const visaExpiringSoon = employees.filter((emp: Employee) => {
    if (!emp.visaExpiryDate) return false;
    const expiry = new Date(emp.visaExpiryDate);
    const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 90 && diffDays >= 0;
  });
  const visaExpired = employees.filter((emp: Employee) => {
    if (!emp.visaExpiryDate) return false;
    return new Date(emp.visaExpiryDate) < today;
  });
  const visaValid = employees.length - visaExpiringSoon.length - visaExpired.length;
  const visaBarData = [
    { name: 'Valid', value: visaValid, color: '#10B981' },
    { name: 'Expiring Soon', value: visaExpiringSoon.length, color: '#F59E42' },
    { name: 'Expired', value: visaExpired.length, color: '#DD1A51' }
  ];

  return (
    <PageTransition className="space-y-6">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6 flex items-center gap-4"
          variants={fadeSlideCard}
        >
          <div className="p-3 rounded-full bg-[#8B0000]/10 text-[#8B0000]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Employees</p>
            <motion.p className="text-2xl font-semibold text-[#1E1E1E]" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              {stats.totalEmployees}
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6 flex items-center gap-4"
          variants={fadeSlideCard}
        >
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Employees</p>
            <motion.p className="text-2xl font-semibold text-[#1E1E1E]" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.7 }}>
              {stats.activeEmployees}
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6 flex items-center gap-4"
          variants={fadeSlideCard}
        >
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Available Employees</p>
            <motion.p className="text-2xl font-semibold text-[#1E1E1E]" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.9 }}>
              {stats.availableEmployees}
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6 flex items-center gap-4"
          variants={fadeSlideCard}
        >
          <div className="p-3 rounded-full bg-[#FFD700]/20 text-[#FFD700]">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <motion.p className="text-2xl font-semibold text-[#1E1E1E]" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.1 }}>
              {stats.totalDepartments}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6"
          variants={fadeSlideCard}
        >
          <h3 className="text-lg font-medium text-[#8B0000] flex items-center">Visa Expiry <AlertTriangle className="w-5 h-5 ml-2 text-yellow-500" /></h3>
          <ul className="mt-4 space-y-2">
            {employees.filter(emp => emp.visaExpiryDate).slice(0, 5).map(emp => (
              <li key={emp.id} className="text-sm text-gray-700 flex items-center">
                {emp.firstName} {emp.lastName}
                {getVisaStatusTag(emp.visaExpiryDate)}
                <span className="ml-2 text-xs text-gray-400">{formatDate(emp.visaExpiryDate)}</span>
              </li>
            ))}
            {stats.expiringVisas === 0 && <li className="text-sm text-gray-500">No upcoming visa expiries.</li>}
          </ul>
        </motion.div>
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6"
          variants={fadeSlideCard}
        >
          <h3 className="text-lg font-medium text-[#8B0000] flex items-center">Missing Documents <FileText className="w-5 h-5 ml-2 text-red-500" /></h3>
          <ul className="mt-4 space-y-2">
            {employees.filter(emp => !emp.documents || emp.documents.length === 0).slice(0, 5).map(emp => (
              <li key={emp.id} className="text-sm text-gray-700">
                {emp.firstName} {emp.lastName}
              </li>
            ))}
            {stats.missingDocuments === 0 && <li className="text-sm text-gray-500">All employees have submitted required documents.</li>}
          </ul>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6"
          variants={fadeSlideCard}
        >
          <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <UserPlus className="h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">New employee joined</p>
                <p className="text-sm text-gray-500">Fatima Ali joined the Finance team</p>
                <p className="text-xs text-gray-400 mt-1">2 days ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Department transfer</p>
                <p className="text-sm text-gray-500">Omar Khan moved from Sales to Marketing</p>
                <p className="text-xs text-gray-400 mt-1">5 days ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <UserMinus className="h-4 w-4" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">Employee departure</p>
                <p className="text-sm text-gray-500">Ahmed Hassan left the company</p>
                <p className="text-xs text-gray-400 mt-1">1 week ago</p>
              </div>
            </li>
          </ul>
        </motion.div>
        <motion.div
          layout
          className="bg-white rounded-2xl shadow p-6"
          variants={fadeSlideCard}
        >
          <h3 className="text-lg font-medium text-gray-800">Department Overview</h3>
          <ul className="mt-4 space-y-2">
            {departments.slice(0, 4).map(dept => (
              <li key={dept.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{dept.name}</p>
                  <p className="text-xs text-gray-500">Manager: {dept.manager}</p>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{dept.employeeCount}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              View all departments
            </button>
          </div>
        </motion.div>
      </motion.div>

      <section className="w-full max-w-6xl mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Employees by Company Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-black">Employees by Company</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={companyPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {companyPieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Visa Expiry Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-black">Visa Expiry Status</h2>
            <div className="flex flex-col gap-2">
              {visaBarData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-black">{item.name}</span>
                  <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden mx-2">
                    <div 
                  style={{ 
                    width: `${(item.value / (employees?.length || 1)) * 100}%`, 
                    backgroundColor: item.color 
                  }} 
                  className="h-3 rounded-full transition-all" 
                />
                  </div>
                  <span className="text-sm text-gray-700 font-semibold min-w-[32px]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FadeSlideUp className="bg-white rounded-2xl shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Employee Directory</h2>
        <SmartSearchBar
          onSearch={setSearchQuery}
          placeholder="Search employees..."
          className="mb-4"
        />
        <EmployeeList
          companyId={employeeDetails?.companyId}
          searchQuery={searchQuery}
          onViewEmployee={handleViewEmployee}
        />
      </FadeSlideUp>
    </PageTransition>
  );
};

export default Dashboard;
