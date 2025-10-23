"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

// Dashboard statistics and analytics
export async function getDashboardStats() {
  try {
    const [
      totalShoots,
      plannedShoots,
      inProgressShoots,
      deliveredShoots,
      issueShoots,
      unpaidShoots,
    ] = await Promise.all([
      // Total shoots count
      db.shoot.count(),
      
      // Planned shoots count
      db.shoot.count({
        where: { status: "planned" }
      }),
      
      // In progress shoots count
      db.shoot.count({
        where: { status: "in_progress" }
      }),
      
      // Delivered shoots count
      db.shoot.count({
        where: { status: "delivered" }
      }),
      
      // Issue shoots (blocked, postponed, cancelled)
      db.shoot.findMany({
        where: {
          status: {
            in: ["blocked", "postponed", "cancelled"]
          }
        },
        include: {
          client: true,
          teamMembers: {
            include: {
              user: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      
      // Unpaid/on-hold shoots (delivered but missing cost info)
      db.shoot.findMany({
        where: {
          status: "delivered",
          OR: [
            { photographyCost: null },
            { editingCost: null }
          ]
        },
        include: {
          client: true,
          teamMembers: {
            include: {
              user: true
            }
          }
        },
        orderBy: { shootEndDate: "desc" },
        take: 10
      })
    ]);

    return {
      totalShoots,
      plannedShoots,
      inProgressShoots,
      deliveredShoots,
      issueShoots,
      unpaidShoots,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

// Monthly growth data for charts
export async function getMonthlyGrowthData() {
  try {
    // Get all shoots first to see what we have
    const allShoots = await db.shoot.findMany({
      select: {
        shootStartDate: true,
        createdAt: true,
        status: true,
        shootId: true
      }
    });
    
    // Group all shoots by month (using createdAt - when shoots were created)
    const groupedData: Record<string, { count: number; planned: number; inProgress: number; delivered: number }> = {};
    
    allShoots.forEach(shoot => {
      const date = shoot.createdAt; // Always use createdAt for monthly growth
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      
      groupedData[monthKey] ??= { count: 0, planned: 0, inProgress: 0, delivered: 0 };
      
      groupedData[monthKey].count++;
      if (shoot.status === 'planned') groupedData[monthKey].planned++;
      if (shoot.status === 'in_progress') groupedData[monthKey].inProgress++;
      if (shoot.status === 'delivered') groupedData[monthKey].delivered++;
    });
    
    console.log("Grouped data by month:", groupedData);
    
    // Get all unique months and sort them
    const allMonths = Object.keys(groupedData).sort();
    console.log("All months found:", allMonths);
    
    // If we have data, show the last 6 months (or all months if less than 6)
    const monthsToShow = allMonths.slice(-6); // Last 6 months
    console.log("Months to show:", monthsToShow);
    
    const monthlyGrowth = [];
    
    for (const monthKey of monthsToShow) {
      const data = groupedData[monthKey];
      if (!data) continue; // Skip if no data for this month
      
      const date = new Date(monthKey + '-01'); // First day of the month
      
      monthlyGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: data.count,
        planned: data.planned,
        inProgress: data.inProgress,
        delivered: data.delivered,
      });
    }
    
    console.log("Final monthly growth data:", monthlyGrowth);
    
    if (monthlyGrowth.length > 0) {
      console.log("Months being displayed in chart:", monthlyGrowth.map(m => m.month));
    } else {
      console.log("No monthly growth data found - this might indicate a database issue");
    }
    
    return monthlyGrowth;
  } catch (error) {
    console.error("Error fetching monthly growth data:", error);
    throw new Error("Failed to fetch monthly growth data");
  }
}

// City growth data for charts
export async function getCityGrowthData() {
  try {
    const shoots = await db.shoot.findMany({
      include: {
        location: true
      }
    });

    const cityGrowth = shoots.reduce((acc, shoot) => {
      const city = shoot.location?.city ?? 'Unknown';
      acc[city] ??= { total: 0, planned: 0, inProgress: 0, delivered: 0 };
      acc[city].total++;
      if (shoot.status === 'planned') acc[city].planned++;
      if (shoot.status === 'in_progress') acc[city].inProgress++;
      if (shoot.status === 'delivered') acc[city].delivered++;
      return acc;
    }, {} as Record<string, { total: number; planned: number; inProgress: number; delivered: number }>);

    return cityGrowth;
  } catch (error) {
    console.error("Error fetching city growth data:", error);
    throw new Error("Failed to fetch city growth data");
  }
}

// Client growth data for charts
export async function getClientGrowthData() {
  try {
    const shoots = await db.shoot.findMany({
      include: {
        client: true
      }
    });

    const clientGrowth = shoots.reduce((acc, shoot) => {
      const clientName = shoot.client.name;
      acc[clientName] ??= { total: 0, planned: 0, inProgress: 0, delivered: 0 };
      acc[clientName].total++;
      if (shoot.status === 'planned') acc[clientName].planned++;
      if (shoot.status === 'in_progress') acc[clientName].inProgress++;
      if (shoot.status === 'delivered') acc[clientName].delivered++;
      return acc;
    }, {} as Record<string, { total: number; planned: number; inProgress: number; delivered: number }>);

    return clientGrowth;
  } catch (error) {
    console.error("Error fetching client growth data:", error);
    throw new Error("Failed to fetch client growth data");
  }
}

// Get all dashboard data in one call for efficiency
export async function getAllDashboardData() {
  try {
    const [
      stats,
      monthlyGrowth,
      cityGrowth,
      clientGrowth
    ] = await Promise.all([
      getDashboardStats(),
      getMonthlyGrowthData(),
      getCityGrowthData(),
      getClientGrowthData()
    ]);


    return {
      stats,
      monthlyGrowth,
      cityGrowth,
      clientGrowth
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}

// Get shoots with issues for detailed view
export async function getShootsWithIssues() {
  try {
    const issueShoots = await db.shoot.findMany({
      where: {
        status: {
          in: ["blocked", "postponed", "cancelled"]
        }
      },
      include: {
        client: true,
        shootType: true,
        location: true,
        teamMembers: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return issueShoots;
  } catch (error) {
    console.error("Error fetching shoots with issues:", error);
    throw new Error("Failed to fetch shoots with issues");
  }
}

// Get unpaid/on-hold shoots for detailed view
export async function getUnpaidShoots() {
  try {
    const unpaidShoots = await db.shoot.findMany({
      where: {
        status: "delivered",
        OR: [
          { photographyCost: null },
          { editingCost: null }
        ]
      },
      include: {
        client: true,
        shootType: true,
        location: true,
        teamMembers: {
          include: {
            user: true
          }
        }
      },
      orderBy: { shootEndDate: "desc" }
    });

    return unpaidShoots;
  } catch (error) {
    console.error("Error fetching unpaid shoots:", error);
    throw new Error("Failed to fetch unpaid shoots");
  }
}

// Get shoots by status for filtering
export async function getShootsByStatus(status: string) {
  try {
    const shoots = await db.shoot.findMany({
      where: { status },
      include: {
        client: true,
        shootType: true,
        location: true,
        teamMembers: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return shoots;
  } catch (error) {
    console.error("Error fetching shoots by status:", error);
    throw new Error("Failed to fetch shoots by status");
  }
}

// Get growth data by date range
export async function getGrowthDataByDateRange(startDate: Date, endDate: Date) {
  try {
    const shoots = await db.shoot.findMany({
      where: {
        shootStartDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        client: true,
        location: true
      }
    });

    // Process data for charts
    const monthlyData: Array<{ month: string; count: number; planned: number; inProgress: number; delivered: number }> = [];
    const cityData: Record<string, { total: number; planned: number; inProgress: number; delivered: number }> = {};
    const clientData: Record<string, { total: number; planned: number; inProgress: number; delivered: number }> = {};

    shoots.forEach(shoot => {
      // Monthly data
      if (shoot.shootStartDate) {
        const monthKey = shoot.shootStartDate.toISOString().slice(0, 7); // YYYY-MM
        const existingMonth = monthlyData.find(m => m.month === monthKey);
        
        if (existingMonth) {
          existingMonth.count++;
          if (shoot.status === 'planned') existingMonth.planned++;
          if (shoot.status === 'in_progress') existingMonth.inProgress++;
          if (shoot.status === 'delivered') existingMonth.delivered++;
        } else {
          monthlyData.push({
            month: monthKey,
            count: 1,
            planned: shoot.status === 'planned' ? 1 : 0,
            inProgress: shoot.status === 'in_progress' ? 1 : 0,
            delivered: shoot.status === 'delivered' ? 1 : 0,
          });
        }
      }

      // City data
      const city = shoot.location?.city ?? 'Unknown';
      cityData[city] ??= { total: 0, planned: 0, inProgress: 0, delivered: 0 };
      cityData[city].total++;
      if (shoot.status === 'planned') cityData[city].planned++;
      if (shoot.status === 'in_progress') cityData[city].inProgress++;
      if (shoot.status === 'delivered') cityData[city].delivered++;

      // Client data
      const clientName = shoot.client.name;
      clientData[clientName] ??= { total: 0, planned: 0, inProgress: 0, delivered: 0 };
      clientData[clientName].total++;
      if (shoot.status === 'planned') clientData[clientName].planned++;
      if (shoot.status === 'in_progress') clientData[clientName].inProgress++;
      if (shoot.status === 'delivered') clientData[clientName].delivered++;
    });

    return {
      monthlyData,
      cityData,
      clientData
    };
  } catch (error) {
    console.error("Error fetching growth data by date range:", error);
    throw new Error("Failed to fetch growth data by date range");
  }
}

// Refresh dashboard data (call this when data changes)
export async function refreshDashboardData() {
  try {
    // Revalidate the dashboard page to ensure fresh data
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error refreshing dashboard data:", error);
    throw new Error("Failed to refresh dashboard data");
  }
}

// Get real-time dashboard metrics
export async function getRealTimeMetrics() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayShoots,
      weekShoots,
      monthShoots,
      activeShoots,
      completedToday
    ] = await Promise.all([
      // Today's shoots
      db.shoot.count({
        where: {
          shootStartDate: {
            gte: today
          }
        }
      }),
      
      // This week's shoots
      db.shoot.count({
        where: {
          shootStartDate: {
            gte: thisWeek
          }
        }
      }),
      
      // This month's shoots
      db.shoot.count({
        where: {
          shootStartDate: {
            gte: thisMonth
          }
        }
      }),
      
      // Currently active shoots
      db.shoot.count({
        where: {
          status: {
            in: ["in_progress", "editing"]
          }
        }
      }),
      
      // Completed today
      db.shoot.count({
        where: {
          status: "delivered",
          shootEndDate: {
            gte: today
          }
        }
      })
    ]);

    return {
      todayShoots,
      weekShoots,
      monthShoots,
      activeShoots,
      completedToday
    };
  } catch (error) {
    console.error("Error fetching real-time metrics:", error);
    throw new Error("Failed to fetch real-time metrics");
  }
}


