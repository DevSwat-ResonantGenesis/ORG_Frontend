import chartTheme from './chartTheme';

const getChartTheme = () => {
  const mode = document.documentElement.getAttribute('data-theme') || 'light';
  return mode === 'dark' ? chartTheme.dark : chartTheme.light;
};

export default getChartTheme;
