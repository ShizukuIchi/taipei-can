export interface Trash {
  _id: number;
  lng: number;
  lat: number;
  road: string;
  district: string;
  detail: string;
  note?: string;
}

export interface RawTrash {
  ['_id']?: number;

  ['行政區']?: string;
  ['﻿行政區']?: string;

  ['經度']?: string;
  ['緯度']?: string;
  ['路名']?: string;
  ['段、號及其他註明']?: string;

  ['其他註明']?: string;
  ['備註']?: string;
}

export function parse(rawData: RawTrash): Trash {
  if (
    !rawData._id ||
    !rawData['經度'] ||
    !rawData['緯度'] ||
    !rawData['路名']
  ) {
    throw new Error('bad data');
  }
  const lng = Number(rawData['經度']);
  const lat = Number(rawData['緯度']);
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    throw new Error('bad data');
  }
  if (!rawData['行政區'] && !rawData['﻿行政區']) {
    throw new Error('bad data');
  }
  return {
    _id: rawData._id,
    lng,
    lat,
    road: rawData['路名'],
    detail: rawData['段、號及其他註明'] || '',
    district: rawData['﻿行政區'] || rawData['行政區'] || '',
    note: rawData['備註'] || rawData['其他註明'],
  };
}

export const trashCanAPIs = [
  // shilin:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=97cc923a-e9ee-4adc-8c3d-335567dc15d3',
  // datong:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=5fa14e06-018b-4851-8316-1ff324384f79',
  // daan:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=f40cd66c-afba-4409-9289-e677b6b8d00e',
  // zhongshan:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=33b2c4c5-9870-4ee9-b280-a3a297c56a22',
  // zhongzheng:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=0b544701-fb47-4fa9-90f1-15b1987da0f5',
  // neihu:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=37eac6d1-6569-43c9-9fcf-fc676417c2cd',
  // wenshan:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=46647394-d47f-4a4d-b0f0-14a60ac2aade',
  // songshan:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=179d0fe1-ef31-4775-b9f0-c17b3adf0fbc',
  // xinyi:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=8cbb344b-83d2-4176-9abd-d84508e7dc73',
  // nangang:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=7b955414-f460-4472-b1a8-44819f74dc86',
  // wanhua:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=5697d81f-7c9d-43fc-a202-ae8804bbd34b',
  // beitou:
  'https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=05d67de9-a034-4177-9f53-10d6f79e02cf',
];
