import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
  fullName?: string; // Optional full name for tooltips
}

interface DistributionChartsProps {
  companyDistribution: ChartData[];
  nationalityDistribution: ChartData[];
  tradeDistribution: ChartData[];
}

const DistributionCharts: React.FC<DistributionChartsProps> = ({
  companyDistribution,
  nationalityDistribution,
  tradeDistribution
}) => {
  // Calculate total for percentages
  const companyTotal = companyDistribution.reduce((sum, item) => sum + item.value, 0);
  const nationalityTotal = nationalityDistribution.reduce((sum, item) => sum + item.value, 0);
  const tradeTotal = tradeDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    }}>
      {/* Company Distribution Chart */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#374151' }}>
          Employee Distribution by Company
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <div style={{
            height: '20px',
            display: 'flex',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {companyDistribution.map((item, index) => (
              <div
                key={index}
                style={{
                  height: '100%',
                  backgroundColor: item.color,
                  width: `${(item.value / companyTotal) * 100}%`
                }}
                title={`${item.fullName || item.label}: ${item.value} employees (${((item.value / companyTotal) * 100).toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {companyDistribution.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: item.color,
                minWidth: '12px',
                marginRight: '8px',
                borderRadius: '2px'
              }} />
              <div style={{
                fontSize: '0.875rem',
                color: '#4b5563',
                display: 'flex',
                flexDirection: 'column',
                width: 'calc(100% - 20px)'
              }}>
                <div
                  style={{
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}
                  title={item.fullName || item.label}
                >
                  {item.label}
                </div>
                <span style={{ fontSize: '0.75rem' }}>
                  {item.value} ({((item.value / companyTotal) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nationality Distribution Chart */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#374151' }}>
          Employee Distribution by Nationality
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {nationalityDistribution.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '120px', fontSize: '0.875rem', color: '#4b5563' }}>
                {item.label}
              </div>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <div style={{
                  height: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: item.color,
                      width: `${(item.value / nationalityTotal) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div style={{ width: '60px', fontSize: '0.875rem', color: '#4b5563', textAlign: 'right' }}>
                {item.value} ({((item.value / nationalityTotal) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Distribution Chart */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#374151' }}>
          Employee Distribution by Trade
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '16px'
        }}>
          {/* Bar Chart View */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {tradeDistribution.map((item, index) => {
              const percentage = (item.value / tradeTotal) * 100;
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '120px', fontSize: '0.875rem', color: '#4b5563' }}>
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                      }}
                      title={item.label}
                    >
                      {item.label}
                    </div>
                  </div>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{
                      height: '24px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: item.color,
                          width: `${percentage}%`,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: percentage > 25 ? '8px' : '0'
                        }}
                      >
                        {percentage > 25 && (
                          <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '500' }}>
                            {item.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '60px', fontSize: '0.875rem', color: '#4b5563', textAlign: 'right' }}>
                    {percentage <= 25 && item.value} {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          <div>Trade Distribution</div>
          <div>Total: {tradeTotal} employees</div>
        </div>
      </div>
    </div>
  );
};

export default DistributionCharts;
