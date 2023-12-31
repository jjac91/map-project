// const { range } = require('d3-array');
// const { scaleQuantile } = require('d3-scale');
import { range  } from 'd3-array';
import { scaleQuantile } from 'd3-scale';


function updatePercentiles(featureCollection, accessor) {
    const { features } = featureCollection;
    const scale = scaleQuantile().domain(features.map(accessor)).range(range(9));
    return {
      type: 'FeatureCollection',
      features: features.map(f => {
        const value = accessor(f);
        const properties = {
          ...f.properties,
          value,
          percentile: scale(value)
        };
        return { ...f, properties };
      })
    };
  }

  export default updatePercentiles