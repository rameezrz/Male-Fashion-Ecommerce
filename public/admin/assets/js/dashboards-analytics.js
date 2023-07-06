/**
 * Dashboard Analytics
 */


'use strict';


(function () {
  let cardColor, headingColor, axisColor, shadeColor, borderColor;

  cardColor = config.colors.white;
  headingColor = config.colors.headingColor;
  axisColor = config.colors.axisColor;
  borderColor = config.colors.borderColor;

  

 


  // Order Statistics Chart
  // --------------------------------------------------------------------

  $(document).ready(() => {
    // AJAX request to fetch the data
    $.ajax({
      url: '/admin-panel/dashboard-data',
      method: 'GET',
      success: (response) => {
        console.log(response);
        const categoryLabels = response.categories.map((item) => item.name);
        const categorySeries = response.categories.map((item) => item.productCount);
        const revenueData = response.revenue.map(item => item.revenue);
        const orderData = response.monthlyOrders.map(item => item.orderCount);
        const canceledOrderData = response.canceledOrders.map(item => item.canceledOrderCount);
        updateChart(revenueData,orderData,canceledOrderData);
        updateCategoryChart(categoryLabels, categorySeries);
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });
    

     // Total Revenue Report Chart - Bar Chart
  // --------------------------------------------------------------------
    const totalRevenueChartEl = document.querySelector('#totalRevenueChart')
    const updateChart = (revenueData,orderData,canceledOrderData) => {
      
    
  const totalRevenueChartOptions = {
    series: [
      {
        name: 'Monthly Revenue',
        type:'bar',
        data: revenueData
      },
      {
        name: 'Orders',
        type:'bar',
        data: orderData
      },
      {
        name: 'Cancelled',
        type:'bar',
        data: canceledOrderData
      }
    ],
    chart: {
      height: 300,
      stacked: true,
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '33%',
        borderRadius: 12,
        startingShape: 'rounded',
        endingShape: 'rounded'
      }
    },
    colors: [config.colors.primary, config.colors.info, config.colors.danger],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 6,
      lineCap: 'round',
      colors: [cardColor]
    },
    legend: {
      show: true,
      horizontalAlign: 'left',
      position: 'top',
      markers: {
        height: 8,
        width: 8,
        radius: 12,
        offsetX: -3
      },
      labels: {
        colors: axisColor
      },
      itemMargin: {
        horizontal: 10
      }
    },
    grid: {
      borderColor: borderColor,
      padding: {
        top: 0,
        bottom: -8,
        left: 20,
        right: 20
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug','Sep','Oct','Nov','Dec'],
      labels: {
        style: {
          fontSize: '13px',
          colors: axisColor
        }
      },
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
          colors: axisColor
        }
      }
    },
    responsive: [
      {
        breakpoint: 1700,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '32%'
            }
          }
        }
      },
      {
        breakpoint: 1580,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '35%'
            }
          }
        }
      },
      {
        breakpoint: 1440,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '42%'
            }
          }
        }
      },
      {
        breakpoint: 1300,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '48%'
            }
          }
        }
      },
      {
        breakpoint: 1200,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '40%'
            }
          }
        }
      },
      {
        breakpoint: 1040,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 11,
              columnWidth: '48%'
            }
          }
        }
      },
      {
        breakpoint: 991,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '30%'
            }
          }
        }
      },
      {
        breakpoint: 840,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '35%'
            }
          }
        }
      },
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '28%'
            }
          }
        }
      },
      {
        breakpoint: 640,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '32%'
            }
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '37%'
            }
          }
        }
      },
      {
        breakpoint: 480,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '45%'
            }
          }
        }
      },
      {
        breakpoint: 420,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '52%'
            }
          }
        }
      },
      {
        breakpoint: 380,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '60%'
            }
          }
        }
      }
    ],
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    }
  };
  const totalRevenueChart = new ApexCharts(totalRevenueChartEl, totalRevenueChartOptions);
  totalRevenueChart.render();
}
    

    const chartOrderStatistics = document.querySelector('#orderStatisticsChart');

    // Function to update the chart with new data
    const updateCategoryChart = (labels, series) => {
      const orderChartConfig = {
        chart: {
          height: 165,
          width: 130,
          type: 'donut'
        },
        labels,
        series,
        colors: [config.colors.primary, config.colors.secondary, config.colors.info, config.colors.success],
        stroke: {
          width: 5,
          colors: cardColor
        },
        dataLabels: {
          enabled: false,
          formatter: function (val, opt) {
            return parseInt(val) + '%';
          }
        },
        legend: {
          show: false
        },
        grid: {
          padding: {
            top: 0,
            bottom: 0,
            right: 15
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '75%',
              labels: {
                show: true,
                value: {
                  fontSize: '1.5rem',
                  fontFamily: 'Public Sans',
                  color: headingColor,
                  offsetY: -15,
                  formatter: function (val) {
                    return parseInt(val) + '%';
                  }
                },
                name: {
                  offsetY: 20,
                  fontFamily: 'Public Sans'
                },
                total: {
                  show: true,
                  fontSize: '0.8125rem',
                  color: axisColor,
                  label: 'Total',
                  formatter: function (w) {
                    return '100%';
                  }
                }
              }
            }
          }
        }
      };

      // Create the chart
      const statisticsChart = new ApexCharts(chartOrderStatistics, orderChartConfig);
      statisticsChart.render();
    };
  });
})()
