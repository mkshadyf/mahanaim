import { Box, Group, Stack, Text, createStyles } from '@mantine/core';

interface PieChartItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartItem[];
}

// Create a custom ring progress component since RingProgress is not available
const useStyles = createStyles((theme) => ({
  ringContainer: {
    position: 'relative',
    width: 180,
    height: 180,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSegment: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '20px solid transparent',
    boxSizing: 'border-box',
  },
  ringLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  }
}));

export function PieChart({ data }: PieChartProps) {
  const { classes } = useStyles();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages and sort by value (descending)
  const chartData = data
    .map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value);
  
  // Create custom ring segments
  const createRingSegments = () => {
    let cumulativePercentage = 0;
    
    return chartData.map((item, index) => {
      const startPercentage = cumulativePercentage;
      cumulativePercentage += item.percentage;
      
      // Convert percentages to degrees for the conic gradient
      const startAngle = startPercentage * 3.6; // 3.6 = 360 / 100
      const endAngle = cumulativePercentage * 3.6;
      
      return (
        <Box
          key={index}
          className={classes.ringSegment}
          sx={{
            borderColor: item.color,
            clipPath: `conic-gradient(from ${startAngle}deg, transparent 0%, transparent 100%, transparent 100%)`,
            transform: `rotate(${startAngle}deg)`,
            borderLeftColor: item.color,
            borderTopColor: item.percentage > 25 ? item.color : 'transparent',
            borderRightColor: item.percentage > 50 ? item.color : 'transparent',
            borderBottomColor: item.percentage > 75 ? item.color : 'transparent',
          }}
          title={`${item.name}: ${item.percentage}%`}
        />
      );
    });
  };
  
  return (
    <Box>
      <Group position="center" align="flex-start">
        <Box className={classes.ringContainer}>
          {createRingSegments()}
          <Box className={classes.ringLabel}>
            <Text size="xs" align="center">
              Total<br />
              <Text size="lg" weight={700}>{total}</Text>
            </Text>
          </Box>
        </Box>
        
        <Stack spacing="xs">
          {chartData.map((item, index) => (
            <Group key={index} spacing="xs">
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: item.color,
                  borderRadius: 4
                }}
              />
              <Text size="sm">
                {item.name} ({item.percentage}%) - {item.value}
              </Text>
            </Group>
          ))}
        </Stack>
      </Group>
    </Box>
  );
} 