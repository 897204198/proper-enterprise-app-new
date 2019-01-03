import numeral from 'numeral';
import './g2';
import ChartCard from './ChartCard';
import Bar from './Bar';
import Pie from './Pie';
import Radar from './Radar';
import Gauge from './Gauge';
import MiniArea from './MiniArea';
import Area from './Area';
import MultiBar from './MultiBar';
import HoriBar from './HoriBar';
import Line from './Line';
import MiniBar from './MiniBar';
import MiniProgress from './MiniProgress';
import Field from './Field';
import WaterWave from './WaterWave';
import TagCloud from './TagCloud';
import TimelineChart from './TimelineChart';

const yuan = val => `&yen; ${numeral(val).format('0,0.00')}`;

export {
  yuan,
  Bar,
  MultiBar,
  HoriBar,
  Line,
  Pie,
  Gauge,
  Radar,
  MiniBar,
  Area,
  MiniArea,
  MiniProgress,
  ChartCard,
  Field,
  WaterWave,
  TagCloud,
  TimelineChart,
};
