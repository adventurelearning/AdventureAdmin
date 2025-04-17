import React from 'react';
import { FiUsers, FiFileText, FiMail, FiBriefcase } from 'react-icons/fi';
import { BsArrowUpRight } from 'react-icons/bs';

const Dashboard = () => {
  const stats = [
    { 
      title: 'Total Users', 
      value: 1245, 
      change: '+12.5%', 
      icon: <FiUsers className="text-xl" />, 
      color: 'bg-blue-100 text-blue-600',
      trend: 'up'
    },
    { 
      title: 'Registrations', 
      value: 342, 
      change: '+5.2%', 
      icon: <FiFileText className="text-xl" />, 
      color: 'bg-green-100 text-green-600',
      trend: 'up'
    },
    { 
      title: 'Enquiries', 
      value: 128, 
      change: '-3.8%', 
      icon: <FiMail className="text-xl" />, 
      color: 'bg-yellow-100 text-yellow-600',
      trend: 'down'
    },
    { 
      title: 'Corporate Leads', 
      value: 47, 
      change: '+24.1%', 
      icon: <FiBriefcase className="text-xl" />, 
      color: 'bg-purple-100 text-purple-600',
      trend: 'up'
    },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Registered for Web Development course', time: '2 mins ago', avatar: 'JD' },
    { id: 2, user: 'Acme Corp', action: 'Requested corporate training', time: '1 hour ago', avatar: 'AC' },
    { id: 3, user: 'Sarah Johnson', action: 'Submitted an enquiry', time: '3 hours ago', avatar: 'SJ' },
    { id: 4, user: 'Mike Williams', action: 'Completed payment', time: '5 hours ago', avatar: 'MW' },
    { id: 5, user: 'Tech Solutions', action: 'Scheduled a demo', time: '1 day ago', avatar: 'TS' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-2">Welcome back! Here's what's happening today.</p>
        </div>
        <div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mb-2">{stat.value.toLocaleString()}</p>
                <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{stat.change}</span>
                  <BsArrowUpRight className={`ml-1 ${stat.trend === 'down' ? 'transform rotate-180' : ''}`} />
                  <span className="text-gray-400 ml-2">vs last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">User Growth</h2>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            {/* Placeholder for chart */}
            User Growth Chart
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Popularity</h2>
          <div className="space-y-4">
            {['Web Development', 'Data Science', 'UX Design', 'Digital Marketing', 'Cloud Computing'].map((course, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{course}</span>
                  <span className="font-medium">{Math.floor(Math.random() * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map(activity => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-medium">{activity.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{activity.user}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.action}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;