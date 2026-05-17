import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PRECOMPUTED = {
  "2010-2011-2012":{accuracy:0.8333,features:[["is_parked_vehicle",-1.175],["is_hit_and_run",-0.9773],["area_Southeast",-0.9134],["is_pedestrian",0.8072],["grid_34.3_-118.6",-0.793],["grid_34.0_-118.35",-0.785],["is_fixed_object",-0.6808],["grid_34.25_-118.6",0.6114],["is_van_nuys_blvd",0.5861],["is_bike",0.5389],["grid_34.15_-118.45",-0.5386],["vict_age",0.499],["hour_of_day",-0.4611],["grid_34.05_-118.55",0.4333],["is_western_ave",0.4279],["grid_34.15_-118.2",-0.42],["is_rush_hour",0.4192],["grid_34.0_-118.3",-0.416],["grid_34.25_-118.35",-0.4054],["sex_M",-0.4017]]},
  "2010-2012-2013":{accuracy:0.9001,features:[["is_hit_and_run",-0.7639],["is_pedestrian",0.7585],["is_bike",0.5861],["is_fixed_object",-0.4305],["is_parked_vehicle",-0.3651],["area_Southwest",-0.3593],["area_77th Street",-0.3232],["area_Southeast",-0.2685],["area_Olympic",0.2672],["is_intersection",0.2627],["area_Rampart",0.2197],["area_Newton",0.2122],["grid_34.05_-118.25",0.2073],["area_Hollenbeck",0.2033],["is_multi_vehicle",0.1956],["area_Northeast",0.191],["area_Harbor",-0.1882],["area_Central",0.1632],["grid_34.05_-118.2",0.1473],["sex_M",-0.1364]]},
  "2010-2013-2014":{accuracy:0.7396,features:[["is_hit_and_run",-0.8383],["is_pedestrian",0.7723],["is_bike",0.5961],["is_fixed_object",-0.4529],["is_parked_vehicle",-0.4457],["area_Southwest",-0.4323],["area_77th Street",-0.4094],["area_Southeast",-0.2952],["area_Olympic",0.2695],["is_intersection",0.261],["area_Rampart",0.2526],["area_Newton",0.2442],["area_Harbor",-0.2387],["is_motorcycle",0.2285],["area_Wilshire",0.2137],["area_Northeast",0.2134],["area_Hollenbeck",0.1989],["area_Pacific",0.1798],["area_Central",0.1697],["area_West LA",0.1546]]},
  "2010-2014-2015":{accuracy:0.8212,features:[["is_hit_and_run",-1.2327],["is_pedestrian",0.9255],["is_bike",0.6617],["is_parked_vehicle",-0.5877],["is_fixed_object",-0.3853],["area_Rampart",0.3828],["area_Newton",0.3387],["area_Northeast",0.3265],["is_motorcycle",0.3047],["is_intersection",0.2865],["area_Southwest",-0.2724],["area_Hollenbeck",0.2654],["area_Central",0.2569],["area_77th Street",-0.2375],["grid_34.05_-118.25",0.2276],["grid_34.05_-118.2",0.1967],["area_Southeast",-0.1851],["grid_34.0_-118.25",0.1795],["descent_X",-0.1714],["grid_34.1_-118.25",0.163]]},
  "2010-2015-2016":{accuracy:0.8467,features:[["is_hit_and_run",-1.3468],["is_pedestrian",0.9623],["is_bike",0.6712],["is_parked_vehicle",-0.6281],["area_Rampart",0.4079],["is_fixed_object",-0.3738],["area_Newton",0.3683],["area_Northeast",0.3554],["is_motorcycle",0.3031],["area_Hollenbeck",0.2847],["is_intersection",0.2798],["area_Central",0.2686],["grid_34.05_-118.25",0.2597],["grid_34.0_-118.25",0.2159],["area_Southwest",-0.2046],["grid_34.05_-118.2",0.204],["area_77th Street",-0.1801],["grid_34.1_-118.2",0.1795],["grid_34.1_-118.25",0.1663],["descent_X",-0.1528]]},
  "2010-2016-2017":{accuracy:0.8537,features:[["is_hit_and_run",-1.3897],["is_pedestrian",0.9781],["is_bike",0.6678],["is_parked_vehicle",-0.6128],["area_Rampart",0.4198],["area_Newton",0.3817],["area_Northeast",0.3688],["is_fixed_object",-0.3408],["is_motorcycle",0.3353],["area_Hollenbeck",0.2907],["area_Central",0.2783],["is_intersection",0.2751],["grid_34.05_-118.25",0.2719],["grid_34.0_-118.25",0.2221],["grid_34.05_-118.2",0.2113],["is_multi_vehicle",0.1962],["area_Southwest",-0.186],["grid_34.1_-118.2",0.1788],["grid_34.1_-118.25",0.1687],["descent_X",-0.157]]},
  "2010-2017-2018":{accuracy:0.8617,features:[["is_hit_and_run",-1.4103],["is_pedestrian",0.9947],["is_bike",0.6643],["is_parked_vehicle",-0.6039],["area_Rampart",0.4305],["area_Newton",0.3943],["area_Northeast",0.3735],["is_motorcycle",0.3352],["is_fixed_object",-0.3184],["area_Hollenbeck",0.2934],["area_Central",0.2828],["is_intersection",0.275],["grid_34.05_-118.25",0.2728],["is_multi_vehicle",0.2233],["grid_34.0_-118.25",0.2205],["grid_34.05_-118.2",0.2123],["grid_34.1_-118.2",0.1762],["area_Southwest",-0.1749],["grid_34.1_-118.25",0.1693],["descent_X",-0.1689]]},
  "2010-2018-2019":{accuracy:0.8566,features:[["is_hit_and_run",-1.4257],["is_pedestrian",1.0028],["is_bike",0.6616],["is_parked_vehicle",-0.5895],["area_Rampart",0.4316],["area_Newton",0.4012],["area_Northeast",0.3778],["is_motorcycle",0.3379],["is_fixed_object",-0.3033],["area_Hollenbeck",0.295],["is_intersection",0.2868],["area_Central",0.2843],["grid_34.05_-118.25",0.2793],["is_multi_vehicle",0.239],["grid_34.0_-118.25",0.2231],["grid_34.05_-118.2",0.2133],["grid_34.1_-118.2",0.1738],["grid_34.1_-118.25",0.1708],["area_Southwest",-0.1704],["descent_X",-0.1658]]},
  "2010-2019-2020":{accuracy:0.8391,features:[["is_hit_and_run",-1.4292],["is_pedestrian",1.0043],["is_bike",0.6572],["is_parked_vehicle",-0.5861],["area_Rampart",0.4296],["area_Newton",0.4093],["area_Northeast",0.3731],["is_motorcycle",0.3344],["is_fixed_object",-0.3037],["is_intersection",0.2949],["area_Hollenbeck",0.2934],["area_Central",0.2887],["grid_34.05_-118.25",0.2825],["is_multi_vehicle",0.2347],["grid_34.0_-118.25",0.2341],["grid_34.05_-118.2",0.2144],["grid_34.1_-118.2",0.1715],["grid_34.1_-118.25",0.1671],["area_Southwest",-0.165],["descent_X",-0.1576]]},
  "2010-2020-2021":{accuracy:0.694,features:[["is_hit_and_run",-1.4171],["is_pedestrian",1.0001],["is_bike",0.649],["is_parked_vehicle",-0.5823],["area_Rampart",0.4256],["area_Newton",0.4048],["area_Northeast",0.3655],["is_motorcycle",0.3312],["is_fixed_object",-0.308],["is_intersection",0.2947],["area_Hollenbeck",0.2881],["area_Central",0.288],["grid_34.05_-118.25",0.285],["is_multi_vehicle",0.2356],["grid_34.0_-118.25",0.2266],["grid_34.05_-118.2",0.2056],["is_dui_alcohol",0.172],["grid_34.1_-118.25",0.1659],["grid_34.1_-118.2",0.1657],["area_Southwest",-0.1581]]},
  "2010-2021-2022":{accuracy:0.6759,features:[["is_hit_and_run",-1.3617],["is_pedestrian",1.017],["is_bike",0.6567],["is_parked_vehicle",-0.5758],["is_motorcycle",0.3383],["area_Newton",0.3257],["area_Rampart",0.3254],["is_fixed_object",-0.3156],["is_intersection",0.3],["area_Northeast",0.2816],["is_multi_vehicle",0.2408],["area_Central",0.2115],["area_Hollenbeck",0.2029],["is_dui_alcohol",0.2023],["is_dui_drugs",-0.1947],["grid_34.05_-118.25",0.1701],["grid_34.0_-118.25",0.1509],["descent_X",-0.1482],["grid_34.05_-118.2",0.1411],["area_Southwest",-0.1353]]},
  "2010-2022-2023":{accuracy:0.6915,features:[["is_hit_and_run",-1.2996],["is_pedestrian",1.0281],["is_bike",0.6612],["is_parked_vehicle",-0.5769],["is_motorcycle",0.3433],["is_fixed_object",-0.3225],["is_intersection",0.302],["area_Newton",0.2835],["area_Rampart",0.2653],["is_multi_vehicle",0.2363],["is_dui_drugs",-0.2345],["is_dui_alcohol",0.2307],["area_Northeast",0.2266],["area_Hollenbeck",0.1678],["area_Central",0.1625],["descent_X",-0.142],["sex_F",0.1234],["descent_B",0.1223],["area_Southwest",-0.121],["grid_34.05_-118.25",0.1151]]},
  "2010-2023-2024":{accuracy:0.6816,features:[["is_hit_and_run",-1.2423],["is_pedestrian",1.0434],["is_bike",0.6631],["is_parked_vehicle",-0.5754],["is_motorcycle",0.3504],["is_fixed_object",-0.3252],["is_intersection",0.3029],["is_dui_drugs",-0.2662],["is_dui_alcohol",0.255],["area_Newton",0.2476],["is_multi_vehicle",0.2342],["area_Rampart",0.2283],["area_Northeast",0.1964],["area_Hollenbeck",0.1459],["descent_X",-0.1361],["area_Central",0.1308],["sex_F",0.1264],["descent_B",0.1209],["is_unlicensed",0.1154],["area_Southwest",-0.1123]]},
  "2011-2012-2013":{accuracy:0.9,features:[["is_hit_and_run",-0.7636],["is_pedestrian",0.7585],["is_bike",0.5859],["is_fixed_object",-0.4296],["is_parked_vehicle",-0.3642],["area_Southwest",-0.359],["area_77th Street",-0.3233],["area_Southeast",-0.2688],["area_Olympic",0.2676],["is_intersection",0.2613],["area_Rampart",0.2197],["area_Newton",0.2113],["grid_34.05_-118.25",0.2071],["area_Hollenbeck",0.2031],["is_multi_vehicle",0.196],["area_Northeast",0.1909],["area_Harbor",-0.1883],["area_Central",0.1626],["grid_34.05_-118.2",0.1473],["sex_M",-0.1371]]},
  "2011-2013-2014":{accuracy:0.7394,features:[["is_hit_and_run",-0.8382],["is_pedestrian",0.7723],["is_bike",0.596],["is_fixed_object",-0.4526],["is_parked_vehicle",-0.4454],["area_Southwest",-0.4323],["area_77th Street",-0.4096],["area_Southeast",-0.2955],["area_Olympic",0.2696],["is_intersection",0.2603],["area_Rampart",0.2526],["area_Newton",0.244],["area_Harbor",-0.2388],["is_motorcycle",0.2285],["area_Wilshire",0.214],["area_Northeast",0.2134],["area_Hollenbeck",0.1988],["area_Pacific",0.1797],["area_Central",0.1695],["area_West LA",0.1587]]},
  "2011-2014-2015":{accuracy:0.8213,features:[["is_hit_and_run",-1.2328],["is_pedestrian",0.9256],["is_bike",0.6617],["is_parked_vehicle",-0.5875],["is_fixed_object",-0.3851],["area_Rampart",0.3829],["area_Newton",0.3386],["area_Northeast",0.3265],["is_motorcycle",0.3047],["is_intersection",0.2864],["area_Southwest",-0.2723],["area_Hollenbeck",0.2654],["area_Central",0.2568],["area_77th Street",-0.2376],["grid_34.05_-118.25",0.2274],["grid_34.05_-118.2",0.1967],["area_Southeast",-0.1851],["grid_34.0_-118.25",0.1796],["descent_X",-0.1715],["grid_34.1_-118.25",0.163]]},
  "2011-2015-2016":{accuracy:0.8467,features:[["is_hit_and_run",-1.3469],["is_pedestrian",0.9624],["is_bike",0.6712],["is_parked_vehicle",-0.628],["area_Rampart",0.408],["is_fixed_object",-0.3737],["area_Newton",0.3683],["area_Northeast",0.3554],["is_motorcycle",0.3031],["area_Hollenbeck",0.2847],["is_intersection",0.2798],["area_Central",0.2685],["grid_34.05_-118.25",0.2596],["grid_34.0_-118.25",0.216],["area_Southwest",-0.2046],["grid_34.05_-118.2",0.204],["area_77th Street",-0.1801],["grid_34.1_-118.2",0.1795],["grid_34.1_-118.25",0.1663],["descent_X",-0.1528]]},
  "2011-2016-2017":{accuracy:0.8537,features:[["is_hit_and_run",-1.3898],["is_pedestrian",0.9782],["is_bike",0.6678],["is_parked_vehicle",-0.6127],["area_Rampart",0.4198],["area_Newton",0.3817],["area_Northeast",0.3688],["is_fixed_object",-0.3407],["is_motorcycle",0.3353],["area_Hollenbeck",0.2907],["area_Central",0.2781],["is_intersection",0.2751],["grid_34.05_-118.25",0.2718],["grid_34.0_-118.25",0.2222],["grid_34.05_-118.2",0.2113],["is_multi_vehicle",0.1962],["area_Southwest",-0.186],["grid_34.1_-118.2",0.1788],["grid_34.1_-118.25",0.1687],["descent_X",-0.157]]},
  "2011-2017-2018":{accuracy:0.8617,features:[["is_hit_and_run",-1.4103],["is_pedestrian",0.9948],["is_bike",0.6642],["is_parked_vehicle",-0.6038],["area_Rampart",0.4305],["area_Newton",0.3943],["area_Northeast",0.3735],["is_motorcycle",0.3352],["is_fixed_object",-0.3183],["area_Hollenbeck",0.2934],["area_Central",0.2828],["is_intersection",0.275],["grid_34.05_-118.25",0.2727],["is_multi_vehicle",0.2233],["grid_34.0_-118.25",0.2205],["grid_34.05_-118.2",0.2123],["grid_34.1_-118.2",0.1762],["area_Southwest",-0.1749],["grid_34.1_-118.25",0.1693],["descent_X",-0.169]]},
  "2011-2018-2019":{accuracy:0.8566,features:[["is_hit_and_run",-1.4258],["is_pedestrian",1.0028],["is_bike",0.6616],["is_parked_vehicle",-0.5895],["area_Rampart",0.4316],["area_Newton",0.4012],["area_Northeast",0.3778],["is_motorcycle",0.3379],["is_fixed_object",-0.3032],["area_Hollenbeck",0.295],["is_intersection",0.2868],["area_Central",0.2843],["grid_34.05_-118.25",0.2792],["is_multi_vehicle",0.239],["grid_34.0_-118.25",0.2231],["grid_34.05_-118.2",0.2134],["grid_34.1_-118.2",0.1738],["grid_34.1_-118.25",0.1708],["area_Southwest",-0.1703],["descent_X",-0.1658]]},
  "2011-2019-2020":{accuracy:0.8391,features:[["is_hit_and_run",-1.4292],["is_pedestrian",1.0043],["is_bike",0.6571],["is_parked_vehicle",-0.586],["area_Rampart",0.4296],["area_Newton",0.4093],["area_Northeast",0.3731],["is_motorcycle",0.3345],["is_fixed_object",-0.3036],["is_intersection",0.2949],["area_Hollenbeck",0.2934],["area_Central",0.2887],["grid_34.05_-118.25",0.2825],["is_multi_vehicle",0.2347],["grid_34.0_-118.25",0.2341],["grid_34.05_-118.2",0.2144],["grid_34.1_-118.2",0.1715],["grid_34.1_-118.25",0.1671],["area_Southwest",-0.165],["descent_X",-0.1577]]},
  "2011-2020-2021":{accuracy:0.694,features:[["is_hit_and_run",-1.4171],["is_pedestrian",1.0002],["is_bike",0.649],["is_parked_vehicle",-0.5823],["area_Rampart",0.4256],["area_Newton",0.4048],["area_Northeast",0.3655],["is_motorcycle",0.3312],["is_fixed_object",-0.3079],["is_intersection",0.2947],["area_Hollenbeck",0.2881],["area_Central",0.288],["grid_34.05_-118.25",0.285],["is_multi_vehicle",0.2356],["grid_34.0_-118.25",0.2266],["grid_34.05_-118.2",0.2056],["is_dui_alcohol",0.172],["grid_34.1_-118.25",0.1659],["grid_34.1_-118.2",0.1657],["area_Southwest",-0.158]]},
  "2011-2021-2022":{accuracy:0.6759,features:[["is_hit_and_run",-1.3618],["is_pedestrian",1.017],["is_bike",0.6566],["is_parked_vehicle",-0.5757],["is_motorcycle",0.3383],["area_Newton",0.3257],["area_Rampart",0.3254],["is_fixed_object",-0.3155],["is_intersection",0.3],["area_Northeast",0.2816],["is_multi_vehicle",0.2408],["area_Central",0.2114],["area_Hollenbeck",0.2029],["is_dui_alcohol",0.2023],["is_dui_drugs",-0.1947],["grid_34.05_-118.25",0.1701],["grid_34.0_-118.25",0.1509],["descent_X",-0.1482],["grid_34.05_-118.2",0.1411],["area_Southwest",-0.1353]]},
  "2011-2022-2023":{accuracy:0.6915,features:[["is_hit_and_run",-1.2996],["is_pedestrian",1.0282],["is_bike",0.6612],["is_parked_vehicle",-0.5768],["is_motorcycle",0.3433],["is_fixed_object",-0.3225],["is_intersection",0.302],["area_Newton",0.2835],["area_Rampart",0.2653],["is_multi_vehicle",0.2363],["is_dui_drugs",-0.2345],["is_dui_alcohol",0.2307],["area_Northeast",0.2266],["area_Hollenbeck",0.1678],["area_Central",0.1624],["descent_X",-0.142],["sex_F",0.1234],["descent_B",0.1224],["area_Southwest",-0.1209],["grid_34.05_-118.25",0.1151]]},
  "2011-2023-2024":{accuracy:0.6816,features:[["is_hit_and_run",-1.2423],["is_pedestrian",1.0434],["is_bike",0.6631],["is_parked_vehicle",-0.5754],["is_motorcycle",0.3504],["is_fixed_object",-0.3251],["is_intersection",0.3029],["is_dui_drugs",-0.2662],["is_dui_alcohol",0.255],["area_Newton",0.2476],["is_multi_vehicle",0.2342],["area_Rampart",0.2283],["area_Northeast",0.1963],["area_Hollenbeck",0.1459],["descent_X",-0.1361],["area_Central",0.1308],["sex_F",0.1264],["descent_B",0.1209],["is_unlicensed",0.1154],["area_Southwest",-0.1122]]},
  "2012-2013-2014":{accuracy:0.7397,features:[["is_hit_and_run",-0.8382],["is_pedestrian",0.771],["is_bike",0.5963],["is_fixed_object",-0.4515],["is_parked_vehicle",-0.4442],["area_Southwest",-0.4332],["area_77th Street",-0.4107],["area_Southeast",-0.2941],["area_Olympic",0.2697],["is_intersection",0.2608],["area_Rampart",0.253],["area_Newton",0.2441],["area_Harbor",-0.2392],["is_motorcycle",0.228],["area_Northeast",0.2157],["area_Wilshire",0.2138],["area_Hollenbeck",0.1991],["area_Pacific",0.1796],["area_Central",0.169],["area_West LA",0.1587]]},
  "2012-2014-2015":{accuracy:0.8211,features:[["is_hit_and_run",-1.2333],["is_pedestrian",0.9245],["is_bike",0.6622],["is_parked_vehicle",-0.5864],["is_fixed_object",-0.3844],["area_Rampart",0.3833],["area_Newton",0.3389],["area_Northeast",0.3281],["is_motorcycle",0.3047],["is_intersection",0.2867],["area_Southwest",-0.2727],["area_Hollenbeck",0.2657],["area_Central",0.2564],["area_77th Street",-0.2381],["grid_34.05_-118.25",0.2273],["grid_34.05_-118.2",0.1968],["area_Southeast",-0.1839],["grid_34.0_-118.25",0.1797],["descent_X",-0.1713],["grid_34.1_-118.25",0.1624]]},
  "2012-2015-2016":{accuracy:0.8467,features:[["is_hit_and_run",-1.3472],["is_pedestrian",0.9616],["is_bike",0.6716],["is_parked_vehicle",-0.6271],["area_Rampart",0.4082],["is_fixed_object",-0.3732],["area_Newton",0.3685],["area_Northeast",0.3566],["is_motorcycle",0.3031],["area_Hollenbeck",0.2848],["is_intersection",0.2799],["area_Central",0.2682],["grid_34.05_-118.25",0.2595],["grid_34.0_-118.25",0.2161],["area_Southwest",-0.2047],["grid_34.05_-118.2",0.2041],["area_77th Street",-0.1804],["grid_34.1_-118.2",0.1794],["grid_34.1_-118.25",0.1659],["descent_X",-0.1527]]},
  "2012-2016-2017":{accuracy:0.8536,features:[["is_hit_and_run",-1.39],["is_pedestrian",0.9776],["is_bike",0.6681],["is_parked_vehicle",-0.612],["area_Rampart",0.4201],["area_Newton",0.3819],["area_Northeast",0.3698],["is_fixed_object",-0.3403],["is_motorcycle",0.3354],["area_Hollenbeck",0.2908],["area_Central",0.278],["is_intersection",0.2752],["grid_34.05_-118.25",0.2717],["grid_34.0_-118.25",0.2223],["grid_34.05_-118.2",0.2114],["is_multi_vehicle",0.1971],["area_Southwest",-0.1861],["grid_34.1_-118.2",0.1787],["grid_34.1_-118.25",0.1684],["descent_X",-0.1569]]},
  "2012-2017-2018":{accuracy:0.8625,features:[["is_hit_and_run",-1.4105],["is_pedestrian",0.9943],["is_bike",0.6644],["is_parked_vehicle",-0.6031],["area_Rampart",0.4307],["area_Newton",0.3944],["area_Northeast",0.3743],["is_motorcycle",0.3353],["is_fixed_object",-0.318],["area_Hollenbeck",0.2935],["area_Central",0.2826],["is_intersection",0.2752],["grid_34.05_-118.25",0.2726],["is_multi_vehicle",0.2241],["grid_34.0_-118.25",0.2206],["grid_34.05_-118.2",0.2123],["grid_34.1_-118.2",0.1761],["area_Southwest",-0.175],["grid_34.1_-118.25",0.1691],["descent_X",-0.1689]]},
  "2012-2018-2019":{accuracy:0.8566,features:[["is_hit_and_run",-1.4259],["is_pedestrian",1.0024],["is_bike",0.6617],["is_parked_vehicle",-0.5889],["area_Rampart",0.4318],["area_Newton",0.4013],["area_Northeast",0.3785],["is_motorcycle",0.3379],["is_fixed_object",-0.303],["area_Hollenbeck",0.2951],["is_intersection",0.2868],["area_Central",0.2841],["grid_34.05_-118.25",0.2792],["is_multi_vehicle",0.2396],["grid_34.0_-118.25",0.2232],["grid_34.05_-118.2",0.2134],["grid_34.1_-118.2",0.1737],["grid_34.1_-118.25",0.1706],["area_Southwest",-0.1704],["descent_X",-0.1657]]},
  "2012-2019-2020":{accuracy:0.8391,features:[["is_hit_and_run",-1.4293],["is_pedestrian",1.004],["is_bike",0.6573],["is_parked_vehicle",-0.5855],["area_Rampart",0.4298],["area_Newton",0.4094],["area_Northeast",0.3737],["is_motorcycle",0.3345],["is_fixed_object",-0.3035],["is_intersection",0.295],["area_Hollenbeck",0.2935],["area_Central",0.2886],["grid_34.05_-118.25",0.2824],["is_multi_vehicle",0.2353],["grid_34.0_-118.25",0.2342],["grid_34.05_-118.2",0.2144],["grid_34.1_-118.2",0.1714],["grid_34.1_-118.25",0.1669],["area_Southwest",-0.1651],["descent_X",-0.1576]]},
  "2012-2020-2021":{accuracy:0.694,features:[["is_hit_and_run",-1.4172],["is_pedestrian",0.9999],["is_bike",0.6491],["is_parked_vehicle",-0.5818],["area_Rampart",0.4257],["area_Newton",0.4049],["area_Northeast",0.366],["is_motorcycle",0.3312],["is_fixed_object",-0.3078],["is_intersection",0.2947],["area_Hollenbeck",0.2881],["area_Central",0.2879],["grid_34.05_-118.25",0.2849],["is_multi_vehicle",0.2361],["grid_34.0_-118.25",0.2267],["grid_34.05_-118.2",0.2056],["is_dui_alcohol",0.1721],["grid_34.1_-118.25",0.1657],["grid_34.1_-118.2",0.1657],["area_Southwest",-0.1581]]},
  "2012-2021-2022":{accuracy:0.676,features:[["is_hit_and_run",-1.3618],["is_pedestrian",1.0167],["is_bike",0.6567],["is_parked_vehicle",-0.5753],["is_motorcycle",0.3383],["area_Newton",0.3258],["area_Rampart",0.3255],["is_fixed_object",-0.3154],["is_intersection",0.3],["area_Northeast",0.2817],["is_multi_vehicle",0.2413],["area_Central",0.2113],["area_Hollenbeck",0.2029],["is_dui_alcohol",0.2023],["is_dui_drugs",-0.1949],["grid_34.05_-118.25",0.17],["grid_34.0_-118.25",0.1509],["descent_X",-0.1481],["grid_34.05_-118.2",0.1411],["area_Southwest",-0.1353]]},
  "2012-2022-2023":{accuracy:0.6915,features:[["is_hit_and_run",-1.2996],["is_pedestrian",1.0279],["is_bike",0.6613],["is_parked_vehicle",-0.5764],["is_motorcycle",0.3433],["is_fixed_object",-0.3224],["is_intersection",0.302],["area_Newton",0.2836],["area_Rampart",0.2654],["is_multi_vehicle",0.2367],["is_dui_drugs",-0.2346],["is_dui_alcohol",0.2308],["area_Northeast",0.2266],["area_Hollenbeck",0.1678],["area_Central",0.1623],["descent_X",-0.1419],["sex_F",0.1234],["descent_B",0.1224],["area_Southwest",-0.121],["grid_34.05_-118.25",0.115]]},
  "2012-2023-2024":{accuracy:0.6815,features:[["is_hit_and_run",-1.2423],["is_pedestrian",1.0432],["is_bike",0.6632],["is_parked_vehicle",-0.575],["is_motorcycle",0.3504],["is_fixed_object",-0.325],["is_intersection",0.303],["is_dui_drugs",-0.2664],["is_dui_alcohol",0.2551],["area_Newton",0.2477],["is_multi_vehicle",0.2346],["area_Rampart",0.2284],["area_Northeast",0.1964],["area_Hollenbeck",0.146],["descent_X",-0.1361],["area_Central",0.1306],["sex_F",0.1264],["descent_B",0.1209],["is_unlicensed",0.1155],["area_Southwest",-0.1123]]},
  "2013-2014-2015":{accuracy:0.8392,features:[["is_hit_and_run",-1.3031],["is_pedestrian",0.9463],["is_bike",0.6615],["is_parked_vehicle",-0.6323],["area_Rampart",0.4098],["is_fixed_object",-0.3807],["area_Newton",0.3543],["area_Northeast",0.3482],["is_motorcycle",0.3417],["is_intersection",0.2834],["area_Central",0.2696],["area_Hollenbeck",0.2656],["area_Southwest",-0.2468],["area_77th Street",-0.22],["grid_34.05_-118.25",0.2164],["grid_34.05_-118.2",0.1971],["descent_X",-0.1968],["grid_34.0_-118.25",0.185],["grid_34.1_-118.25",0.1691],["grid_34.1_-118.2",0.1671]]},
  "2013-2015-2016":{accuracy:0.8542,features:[["is_hit_and_run",-1.3839],["is_pedestrian",0.9699],["is_bike",0.6623],["is_parked_vehicle",-0.648],["area_Rampart",0.4204],["area_Newton",0.377],["area_Northeast",0.3664],["is_fixed_object",-0.3655],["is_motorcycle",0.3268],["area_Hollenbeck",0.2837],["is_intersection",0.2807],["area_Central",0.2736],["grid_34.05_-118.25",0.253],["grid_34.0_-118.25",0.2237],["grid_34.05_-118.2",0.2015],["grid_34.1_-118.2",0.1855],["area_Southwest",-0.1798],["grid_34.1_-118.25",0.1688],["descent_X",-0.167],["area_77th Street",-0.1619]]},
  "2013-2016-2017":{accuracy:0.8563,features:[["is_hit_and_run",-1.4102],["is_pedestrian",0.9804],["is_bike",0.6547],["is_parked_vehicle",-0.6201],["area_Rampart",0.4276],["area_Newton",0.3877],["area_Northeast",0.3765],["is_motorcycle",0.3558],["is_fixed_object",-0.3303],["area_Hollenbeck",0.2893],["area_Central",0.2818],["is_intersection",0.2792],["grid_34.05_-118.25",0.2672],["grid_34.0_-118.25",0.2274],["is_multi_vehicle",0.2099],["grid_34.05_-118.2",0.2095],["grid_34.1_-118.2",0.182],["grid_34.1_-118.25",0.1703],["area_Southwest",-0.1671],["descent_X",-0.166]]},
  "2013-2017-2018":{accuracy:0.8632,features:[["is_hit_and_run",-1.4221],["is_pedestrian",0.9957],["is_bike",0.65],["is_parked_vehicle",-0.6068],["area_Rampart",0.4362],["area_Newton",0.3995],["area_Northeast",0.3786],["is_motorcycle",0.3508],["is_fixed_object",-0.3088],["area_Hollenbeck",0.2918],["area_Central",0.2853],["is_intersection",0.2804],["grid_34.05_-118.25",0.2681],["is_multi_vehicle",0.2373],["grid_34.0_-118.25",0.2237],["grid_34.05_-118.2",0.2104],["grid_34.1_-118.2",0.1779],["descent_X",-0.1754],["grid_34.1_-118.25",0.1701],["area_Southwest",-0.1603]]},
  "2013-2018-2019":{accuracy:0.8569,features:[["is_hit_and_run",-1.4338],["is_pedestrian",1.0033],["is_bike",0.6477],["is_parked_vehicle",-0.5902],["area_Rampart",0.4359],["area_Newton",0.4059],["area_Northeast",0.3818],["is_motorcycle",0.3508],["is_fixed_object",-0.2948],["area_Hollenbeck",0.2935],["is_intersection",0.2925],["area_Central",0.2862],["grid_34.05_-118.25",0.2759],["is_multi_vehicle",0.252],["grid_34.0_-118.25",0.2259],["grid_34.05_-118.2",0.2116],["grid_34.1_-118.2",0.1748],["grid_34.1_-118.25",0.1717],["descent_X",-0.1713],["area_Southwest",-0.1582]]},
  "2013-2019-2020":{accuracy:0.8396,features:[["is_hit_and_run",-1.4349],["is_pedestrian",1.0048],["is_bike",0.6439],["is_parked_vehicle",-0.5864],["area_Rampart",0.4328],["area_Newton",0.4141],["area_Northeast",0.3758],["is_motorcycle",0.3452],["is_intersection",0.3003],["is_fixed_object",-0.2967],["area_Hollenbeck",0.2919],["area_Central",0.2908],["grid_34.05_-118.25",0.28],["is_multi_vehicle",0.2459],["grid_34.0_-118.25",0.2374],["grid_34.05_-118.2",0.2129],["grid_34.1_-118.2",0.1721],["grid_34.1_-118.25",0.1675],["descent_X",-0.1622],["is_dui_alcohol",0.1546]]},
  "2013-2020-2021":{accuracy:0.6941,features:[["is_hit_and_run",-1.421],["is_pedestrian",1.0001],["is_bike",0.636],["is_parked_vehicle",-0.5822],["area_Rampart",0.428],["area_Newton",0.4086],["area_Northeast",0.367],["is_motorcycle",0.3404],["is_fixed_object",-0.3019],["is_intersection",0.2996],["area_Central",0.2898],["area_Hollenbeck",0.286],["grid_34.05_-118.25",0.2828],["is_multi_vehicle",0.2455],["grid_34.0_-118.25",0.2288],["grid_34.05_-118.2",0.2034],["is_dui_alcohol",0.1797],["grid_34.1_-118.25",0.166],["grid_34.1_-118.2",0.1655],["descent_X",-0.1591]]},
  "2013-2021-2022":{accuracy:0.6782,features:[["is_hit_and_run",-1.3613],["is_pedestrian",1.0169],["is_bike",0.6435],["is_parked_vehicle",-0.5751],["is_motorcycle",0.347],["area_Newton",0.3247],["area_Rampart",0.3225],["is_fixed_object",-0.3099],["is_intersection",0.3043],["area_Northeast",0.2766],["is_multi_vehicle",0.25],["is_dui_alcohol",0.211],["area_Central",0.2091],["area_Hollenbeck",0.1976],["is_dui_drugs",-0.1953],["grid_34.05_-118.25",0.1627],["descent_X",-0.152],["grid_34.0_-118.25",0.1489],["grid_34.05_-118.2",0.1363],["area_Southwest",-0.1253]]},
  "2013-2022-2023":{accuracy:0.6933,features:[["is_hit_and_run",-1.2956],["is_pedestrian",1.0279],["is_bike",0.6479],["is_parked_vehicle",-0.5764],["is_motorcycle",0.3514],["is_fixed_object",-0.3173],["is_intersection",0.3062],["area_Newton",0.2819],["area_Rampart",0.2619],["is_multi_vehicle",0.2443],["is_dui_alcohol",0.2405],["is_dui_drugs",-0.2344],["area_Northeast",0.2209],["area_Hollenbeck",0.164],["area_Central",0.1598],["descent_X",-0.1457],["descent_B",0.1199],["is_unlicensed",0.1195],["area_Southwest",-0.1114],["sex_F",0.1098]]},
  "2013-2023-2024":{accuracy:0.6823,features:[["is_hit_and_run",-1.2354],["is_pedestrian",1.0436],["is_bike",0.6498],["is_parked_vehicle",-0.5751],["is_motorcycle",0.3582],["is_fixed_object",-0.3203],["is_intersection",0.3071],["is_dui_drugs",-0.2658],["is_dui_alcohol",0.2655],["area_Newton",0.2456],["is_multi_vehicle",0.2412],["area_Rampart",0.2252],["area_Northeast",0.1907],["area_Hollenbeck",0.1425],["descent_X",-0.1397],["area_Central",0.1283],["is_unlicensed",0.1256],["descent_B",0.1185],["sex_F",0.1129],["area_Southwest",-0.1032]]},
  "2014-2015-2016":{accuracy:0.8574,features:[["is_hit_and_run",-1.4362],["is_pedestrian",0.984],["is_parked_vehicle",-0.6541],["is_bike",0.6341],["area_Rampart",0.4355],["area_Newton",0.3899],["area_Northeast",0.3786],["is_fixed_object",-0.3417],["is_motorcycle",0.323],["area_Hollenbeck",0.2938],["area_Central",0.2928],["is_intersection",0.2901],["grid_34.05_-118.25",0.2852],["grid_34.0_-118.25",0.2339],["grid_34.05_-118.2",0.2071],["grid_34.1_-118.2",0.1935],["is_multi_vehicle",0.1847],["descent_X",-0.1821],["grid_34.1_-118.25",0.1647],["area_Southwest",-0.1351]]},
  "2014-2016-2017":{accuracy:0.8577,features:[["is_hit_and_run",-1.438],["is_pedestrian",0.9848],["is_bike",0.6249],["is_parked_vehicle",-0.6167],["area_Rampart",0.4371],["area_Newton",0.3967],["area_Northeast",0.3847],["is_motorcycle",0.357],["is_fixed_object",-0.3102],["area_Hollenbeck",0.296],["area_Central",0.2955],["is_intersection",0.2914],["grid_34.05_-118.25",0.2905],["is_multi_vehicle",0.2357],["grid_34.0_-118.25",0.2339],["grid_34.05_-118.2",0.2139],["grid_34.1_-118.2",0.1853],["descent_X",-0.1725],["grid_34.1_-118.25",0.1677],["area_Southwest",-0.1386]]},
  "2014-2017-2018":{accuracy:0.8631,features:[["is_hit_and_run",-1.4387],["is_pedestrian",0.9985],["is_bike",0.6219],["is_parked_vehicle",-0.6023],["area_Rampart",0.4435],["area_Newton",0.4074],["area_Northeast",0.3839],["is_motorcycle",0.3489],["area_Hollenbeck",0.2966],["area_Central",0.2951],["is_fixed_object",-0.2927],["is_intersection",0.2925],["grid_34.05_-118.25",0.2846],["is_multi_vehicle",0.2594],["grid_34.0_-118.25",0.2275],["grid_34.05_-118.2",0.2135],["descent_X",-0.1793],["grid_34.1_-118.2",0.1792],["grid_34.1_-118.25",0.1677],["area_Southwest",-0.1404]]},
  "2014-2018-2019":{accuracy:0.8571,features:[["is_hit_and_run",-1.4458],["is_pedestrian",1.0059],["is_bike",0.6227],["is_parked_vehicle",-0.5852],["area_Rampart",0.4413],["area_Newton",0.4128],["area_Northeast",0.3862],["is_motorcycle",0.3486],["is_intersection",0.3042],["area_Hollenbeck",0.2976],["area_Central",0.2942],["grid_34.05_-118.25",0.29],["is_fixed_object",-0.2815],["is_multi_vehicle",0.2706],["grid_34.0_-118.25",0.2292],["grid_34.05_-118.2",0.2143],["grid_34.1_-118.2",0.1753],["descent_X",-0.1747],["grid_34.1_-118.25",0.1701],["area_Southwest",-0.1426]]},
  "2014-2019-2020":{accuracy:0.84,features:[["is_hit_and_run",-1.4439],["is_pedestrian",1.0075],["is_bike",0.6218],["is_parked_vehicle",-0.5815],["area_Rampart",0.4369],["area_Newton",0.4209],["area_Northeast",0.3784],["is_motorcycle",0.343],["is_intersection",0.3105],["area_Central",0.298],["area_Hollenbeck",0.2952],["grid_34.05_-118.25",0.2922],["is_fixed_object",-0.2855],["is_multi_vehicle",0.2621],["grid_34.0_-118.25",0.2416],["grid_34.05_-118.2",0.2153],["grid_34.1_-118.2",0.1721],["grid_34.1_-118.25",0.1656],["is_dui_alcohol",0.1654],["descent_X",-0.1648]]},
  "2014-2020-2021":{accuracy:0.6943,features:[["is_hit_and_run",-1.4275],["is_pedestrian",1.0023],["is_bike",0.6153],["is_parked_vehicle",-0.5768],["area_Rampart",0.431],["area_Newton",0.414],["area_Northeast",0.3684],["is_motorcycle",0.3378],["is_intersection",0.3084],["area_Central",0.2958],["grid_34.05_-118.25",0.2938],["is_fixed_object",-0.2917],["area_Hollenbeck",0.2881],["is_multi_vehicle",0.2599],["grid_34.0_-118.25",0.2315],["grid_34.05_-118.2",0.2043],["is_dui_alcohol",0.1907],["grid_34.1_-118.2",0.1646],["grid_34.1_-118.25",0.164],["descent_X",-0.1616]]},
  "2014-2021-2022":{accuracy:0.6805,features:[["is_hit_and_run",-1.3616],["is_pedestrian",1.019],["is_bike",0.623],["is_parked_vehicle",-0.5701],["is_motorcycle",0.3445],["area_Newton",0.3242],["area_Rampart",0.317],["is_intersection",0.3121],["is_fixed_object",-0.301],["area_Northeast",0.2721],["is_multi_vehicle",0.2627],["is_dui_alcohol",0.2234],["area_Central",0.2089],["is_dui_drugs",-0.1969],["area_Hollenbeck",0.1949],["grid_34.05_-118.25",0.1612],["descent_X",-0.1541],["grid_34.0_-118.25",0.1467],["grid_34.05_-118.2",0.1324],["is_unlicensed",0.1199]]},
  "2014-2022-2023":{accuracy:0.6936,features:[["is_hit_and_run",-1.2906],["is_pedestrian",1.0296],["is_bike",0.6277],["is_parked_vehicle",-0.5727],["is_motorcycle",0.3489],["is_intersection",0.3135],["is_fixed_object",-0.3095],["area_Newton",0.2809],["area_Rampart",0.2555],["is_multi_vehicle",0.2543],["is_dui_alcohol",0.2543],["is_dui_drugs",-0.2354],["area_Northeast",0.2165],["area_Hollenbeck",0.1631],["area_Central",0.1591],["descent_X",-0.1477],["is_unlicensed",0.1309],["descent_B",0.1167],["grid_34.05_-118.25",0.1057],["area_Hollywood",-0.1044]]},
  "2014-2023-2024":{accuracy:0.6825,features:[["is_hit_and_run",-1.2265],["is_pedestrian",1.0459],["is_bike",0.6298],["is_parked_vehicle",-0.5723],["is_motorcycle",0.356],["is_intersection",0.314],["is_fixed_object",-0.3133],["is_dui_alcohol",0.2802],["is_dui_drugs",-0.2662],["is_multi_vehicle",0.2492],["area_Newton",0.2438],["area_Rampart",0.2191],["area_Northeast",0.1866],["area_Hollenbeck",0.142],["descent_X",-0.1417],["is_unlicensed",0.1368],["area_Central",0.1275],["descent_B",0.1155],["sex_F",0.1049],["area_Hollywood",-0.0986]]},
  "2015-2016-2017":{accuracy:0.8569,features:[["is_hit_and_run",-1.4443],["is_pedestrian",0.9756],["is_bike",0.6122],["is_parked_vehicle",-0.605],["area_Rampart",0.4249],["area_Newton",0.402],["area_Northeast",0.3851],["is_motorcycle",0.3702],["is_fixed_object",-0.3053],["is_intersection",0.3031],["grid_34.05_-118.25",0.3019],["area_Hollenbeck",0.2979],["area_Central",0.2835],["is_multi_vehicle",0.2722],["grid_34.0_-118.25",0.2525],["grid_34.05_-118.2",0.2118],["grid_34.1_-118.2",0.1876],["grid_34.1_-118.25",0.1679],["descent_X",-0.1479],["area_Hollywood",-0.1436]]},
  "2015-2017-2018":{accuracy:0.8635,features:[["is_hit_and_run",-1.4414],["is_pedestrian",0.9947],["is_bike",0.6096],["is_parked_vehicle",-0.5925],["area_Rampart",0.4383],["area_Newton",0.4145],["area_Northeast",0.3838],["is_motorcycle",0.3555],["is_intersection",0.3012],["area_Hollenbeck",0.2988],["grid_34.05_-118.25",0.2908],["area_Central",0.2873],["is_fixed_object",-0.287],["is_multi_vehicle",0.2867],["grid_34.0_-118.25",0.2384],["grid_34.05_-118.2",0.2124],["grid_34.1_-118.2",0.1794],["grid_34.1_-118.25",0.1685],["descent_X",-0.1652],["area_Olympic",-0.1345]]},
  "2015-2018-2019":{accuracy:0.857,features:[["is_hit_and_run",-1.4493],["is_pedestrian",1.005],["is_bike",0.6127],["is_parked_vehicle",-0.5751],["area_Rampart",0.4368],["area_Newton",0.4194],["area_Northeast",0.3863],["is_motorcycle",0.3532],["is_intersection",0.3133],["area_Hollenbeck",0.2995],["grid_34.05_-118.25",0.2957],["is_multi_vehicle",0.2926],["area_Central",0.2881],["is_fixed_object",-0.276],["grid_34.0_-118.25",0.2378],["grid_34.05_-118.2",0.2137],["grid_34.1_-118.2",0.1749],["grid_34.1_-118.25",0.1713],["descent_X",-0.1638],["area_Hollywood",-0.1391]]},
  "2015-2019-2020":{accuracy:0.84,features:[["is_hit_and_run",-1.4465],["is_pedestrian",1.0076],["is_bike",0.614],["is_parked_vehicle",-0.5719],["area_Rampart",0.4324],["area_Newton",0.4275],["area_Northeast",0.3773],["is_motorcycle",0.3463],["is_intersection",0.3185],["grid_34.05_-118.25",0.2974],["area_Hollenbeck",0.2964],["area_Central",0.2938],["is_fixed_object",-0.2808],["is_multi_vehicle",0.2798],["grid_34.0_-118.25",0.2501],["grid_34.05_-118.2",0.215],["is_dui_alcohol",0.1775],["grid_34.1_-118.2",0.1713],["grid_34.1_-118.25",0.1658],["descent_X",-0.1553]]},
  "2015-2020-2021":{accuracy:0.6943,features:[["is_hit_and_run",-1.4274],["is_pedestrian",1.002],["is_bike",0.608],["is_parked_vehicle",-0.5671],["area_Rampart",0.4263],["area_Newton",0.4185],["area_Northeast",0.3661],["is_motorcycle",0.3403],["is_intersection",0.3148],["grid_34.05_-118.25",0.2987],["area_Central",0.2917],["area_Hollenbeck",0.2881],["is_fixed_object",-0.2875],["is_multi_vehicle",0.2757],["grid_34.0_-118.25",0.2371],["is_dui_alcohol",0.2029],["grid_34.05_-118.2",0.2023],["grid_34.1_-118.25",0.1639],["grid_34.1_-118.2",0.1627],["descent_X",-0.153]]},
  "2015-2021-2022":{accuracy:0.6839,features:[["is_hit_and_run",-1.3524],["is_pedestrian",1.0195],["is_bike",0.6163],["is_parked_vehicle",-0.5605],["is_motorcycle",0.3474],["area_Newton",0.3201],["is_intersection",0.3185],["area_Rampart",0.3034],["is_fixed_object",-0.2982],["is_multi_vehicle",0.2769],["area_Northeast",0.263],["is_dui_alcohol",0.2371],["is_dui_drugs",-0.2072],["area_Central",0.2001],["area_Hollenbeck",0.1904],["grid_34.05_-118.25",0.1552],["grid_34.0_-118.25",0.1457],["descent_X",-0.1454],["grid_34.05_-118.2",0.1256],["descent_B",0.1194]]},
  "2015-2022-2023":{accuracy:0.6946,features:[["is_hit_and_run",-1.2736],["is_pedestrian",1.0305],["is_bike",0.6216],["is_parked_vehicle",-0.5643],["is_motorcycle",0.352],["is_intersection",0.3202],["is_fixed_object",-0.3077],["area_Newton",0.2758],["is_dui_alcohol",0.2694],["is_multi_vehicle",0.2657],["is_dui_drugs",-0.2449],["area_Rampart",0.2419],["area_Northeast",0.2069],["area_Hollenbeck",0.1603],["area_Central",0.15],["descent_X",-0.1391],["is_unlicensed",0.1299],["descent_B",0.1198],["area_Hollywood",-0.1084],["sex_F",0.1067]]},
  "2015-2023-2024":{accuracy:0.6841,features:[["is_hit_and_run",-1.2036],["is_pedestrian",1.0481],["is_bike",0.6239],["is_parked_vehicle",-0.5648],["is_motorcycle",0.3598],["is_intersection",0.3207],["is_fixed_object",-0.312],["is_dui_alcohol",0.2964],["is_dui_drugs",-0.2749],["is_multi_vehicle",0.2585],["area_Newton",0.2375],["area_Rampart",0.2062],["area_Northeast",0.177],["area_Hollenbeck",0.139],["is_unlicensed",0.136],["descent_X",-0.1331],["descent_B",0.1183],["area_Central",0.1182],["sex_F",0.1089],["area_Hollywood",-0.1022]]},
  "2016-2017-2018":{accuracy:0.8636,features:[["is_hit_and_run",-1.4384],["is_pedestrian",1.0042],["is_bike",0.5982],["is_parked_vehicle",-0.5683],["area_Rampart",0.4539],["area_Newton",0.4222],["area_Northeast",0.3871],["is_motorcycle",0.3734],["is_multi_vehicle",0.3089],["is_intersection",0.301],["area_Hollenbeck",0.2985],["area_Central",0.2969],["grid_34.05_-118.25",0.2828],["is_fixed_object",-0.26],["grid_34.0_-118.25",0.2227],["grid_34.05_-118.2",0.2188],["descent_X",-0.1725],["grid_34.1_-118.25",0.1717],["grid_34.1_-118.2",0.1661],["area_Olympic",-0.1467]]},
  "2016-2018-2019":{accuracy:0.8572,features:[["is_hit_and_run",-1.4499],["is_pedestrian",1.0146],["is_bike",0.6061],["is_parked_vehicle",-0.5531],["area_Rampart",0.4458],["area_Newton",0.426],["area_Northeast",0.3894],["is_motorcycle",0.3639],["is_intersection",0.3163],["is_multi_vehicle",0.309],["area_Hollenbeck",0.2991],["area_Central",0.2949],["grid_34.05_-118.25",0.2922],["is_fixed_object",-0.2534],["grid_34.0_-118.25",0.2271],["grid_34.05_-118.2",0.2183],["grid_34.1_-118.25",0.1746],["descent_X",-0.168],["grid_34.1_-118.2",0.1649],["area_Southwest",-0.1447]]},
  "2016-2019-2020":{accuracy:0.8401,features:[["is_hit_and_run",-1.4466],["is_pedestrian",1.016],["is_bike",0.6099],["is_parked_vehicle",-0.553],["area_Rampart",0.4379],["area_Newton",0.4345],["area_Northeast",0.3776],["is_motorcycle",0.3533],["is_intersection",0.3211],["area_Central",0.3002],["area_Hollenbeck",0.2954],["grid_34.05_-118.25",0.2952],["is_multi_vehicle",0.2899],["is_fixed_object",-0.2628],["grid_34.0_-118.25",0.2452],["grid_34.05_-118.2",0.2187],["is_dui_alcohol",0.196],["grid_34.1_-118.25",0.1669],["grid_34.1_-118.2",0.1631],["descent_X",-0.1556]]},
  "2016-2020-2021":{accuracy:0.6948,features:[["is_hit_and_run",-1.4242],["is_pedestrian",1.0082],["is_bike",0.6035],["is_parked_vehicle",-0.5502],["area_Rampart",0.4294],["area_Newton",0.423],["area_Northeast",0.3639],["is_motorcycle",0.3453],["is_intersection",0.3159],["grid_34.05_-118.25",0.2969],["area_Central",0.2968],["area_Hollenbeck",0.2854],["is_multi_vehicle",0.2835],["is_fixed_object",-0.2735],["grid_34.0_-118.25",0.2307],["is_dui_alcohol",0.2205],["grid_34.05_-118.2",0.2028],["is_dui_drugs",-0.1651],["grid_34.1_-118.25",0.1644],["grid_34.1_-118.2",0.1539]]},
  "2016-2021-2022":{accuracy:0.6865,features:[["is_hit_and_run",-1.336],["is_pedestrian",1.0269],["is_bike",0.6128],["is_parked_vehicle",-0.5447],["is_motorcycle",0.3527],["is_intersection",0.3198],["area_Newton",0.3157],["area_Rampart",0.2911],["is_fixed_object",-0.2883],["is_multi_vehicle",0.2834],["is_dui_alcohol",0.2566],["area_Northeast",0.2533],["is_dui_drugs",-0.2243],["area_Central",0.1952],["area_Hollenbeck",0.1794],["descent_X",-0.1443],["grid_34.05_-118.25",0.1429],["grid_34.0_-118.25",0.1326],["descent_B",0.1299],["is_unlicensed",0.1233]]},
  "2016-2022-2023":{accuracy:0.6956,features:[["is_hit_and_run",-1.2462],["is_pedestrian",1.0382],["is_bike",0.6186],["is_parked_vehicle",-0.5508],["is_motorcycle",0.3574],["is_intersection",0.3223],["is_fixed_object",-0.3006],["is_dui_alcohol",0.2906],["area_Newton",0.2705],["is_multi_vehicle",0.2687],["is_dui_drugs",-0.2608],["area_Rampart",0.2282],["area_Northeast",0.1968],["area_Hollenbeck",0.1507],["area_Central",0.1428],["descent_X",-0.1377],["is_unlicensed",0.1337],["descent_B",0.1294],["sex_F",0.1159],["area_Hollywood",-0.1048]]},
  "2016-2023-2024":{accuracy:0.6847,features:[["is_hit_and_run",-1.1682],["is_pedestrian",1.0571],["is_bike",0.6211],["is_parked_vehicle",-0.5528],["is_motorcycle",0.3658],["is_intersection",0.3233],["is_dui_alcohol",0.3188],["is_fixed_object",-0.3064],["is_dui_drugs",-0.2896],["is_multi_vehicle",0.2593],["area_Newton",0.2305],["area_Rampart",0.1924],["area_Northeast",0.1671],["is_unlicensed",0.1384],["descent_X",-0.1314],["area_Hollenbeck",0.129],["descent_B",0.127],["sex_F",0.1173],["area_Central",0.1099],["area_Hollywood",-0.0983]]},
  "2017-2018-2019":{accuracy:0.8572,features:[["is_hit_and_run",-1.4574],["is_pedestrian",1.0328],["is_bike",0.6142],["is_parked_vehicle",-0.5468],["area_Rampart",0.4467],["area_Newton",0.4348],["area_Northeast",0.3865],["is_motorcycle",0.3343],["is_intersection",0.3229],["is_multi_vehicle",0.31],["area_Hollenbeck",0.2991],["area_Central",0.2919],["grid_34.05_-118.25",0.2903],["is_fixed_object",-0.2471],["grid_34.0_-118.25",0.2237],["grid_34.05_-118.2",0.2149],["descent_X",-0.178],["grid_34.1_-118.25",0.1741],["is_dui_alcohol",0.1703],["grid_34.1_-118.2",0.1621]]},
  "2017-2019-2020":{accuracy:0.8399,features:[["is_hit_and_run",-1.4509],["is_pedestrian",1.0274],["is_bike",0.6167],["is_parked_vehicle",-0.5496],["area_Newton",0.4434],["area_Rampart",0.4362],["area_Northeast",0.3714],["is_motorcycle",0.3296],["is_intersection",0.3268],["area_Central",0.3002],["grid_34.05_-118.25",0.2946],["area_Hollenbeck",0.2943],["is_multi_vehicle",0.282],["is_fixed_object",-0.2615],["grid_34.0_-118.25",0.2485],["is_dui_alcohol",0.2246],["grid_34.05_-118.2",0.2168],["is_dui_drugs",-0.1664],["grid_34.1_-118.25",0.1641],["grid_34.1_-118.2",0.1603]]},
  "2017-2020-2021":{accuracy:0.695,features:[["is_hit_and_run",-1.422],["is_pedestrian",1.0145],["is_bike",0.6068],["is_parked_vehicle",-0.5478],["area_Newton",0.4268],["area_Rampart",0.4263],["area_Northeast",0.355],["is_motorcycle",0.324],["is_intersection",0.3187],["grid_34.05_-118.25",0.2968],["area_Central",0.2957],["area_Hollenbeck",0.2821],["is_fixed_object",-0.2761],["is_multi_vehicle",0.2739],["is_dui_alcohol",0.2466],["grid_34.0_-118.25",0.2294],["grid_34.05_-118.2",0.1971],["is_dui_drugs",-0.1877],["grid_34.1_-118.25",0.1614],["descent_X",-0.1526]]},
  "2017-2021-2022":{accuracy:0.6908,features:[["is_hit_and_run",-1.3125],["is_pedestrian",1.0341],["is_bike",0.617],["is_parked_vehicle",-0.542],["is_motorcycle",0.3349],["is_intersection",0.3234],["area_Newton",0.3046],["is_fixed_object",-0.2944],["is_dui_alcohol",0.2846],["is_multi_vehicle",0.2727],["area_Rampart",0.2706],["is_dui_drugs",-0.2468],["area_Northeast",0.2343],["area_Central",0.1832],["area_Hollenbeck",0.1696],["descent_X",-0.1439],["descent_B",0.1388],["sex_F",0.1284],["grid_34.05_-118.25",0.1263],["grid_34.0_-118.25",0.1225]]},
  "2017-2022-2023":{accuracy:0.697,features:[["is_hit_and_run",-1.2065],["is_pedestrian",1.0457],["is_bike",0.6232],["is_parked_vehicle",-0.5499],["is_motorcycle",0.342],["is_intersection",0.327],["is_dui_alcohol",0.3202],["is_fixed_object",-0.3083],["is_dui_drugs",-0.2808],["area_Newton",0.2576],["is_multi_vehicle",0.2546],["area_Rampart",0.2074],["area_Northeast",0.1771],["area_Hollenbeck",0.143],["descent_X",-0.1376],["descent_B",0.1375],["is_unlicensed",0.1323],["area_Central",0.1295],["sex_F",0.1294],["area_Hollywood",-0.0996]]},
  "2017-2023-2024":{accuracy:0.6877,features:[["is_hit_and_run",-1.1171],["is_pedestrian",1.0665],["is_bike",0.6252],["is_parked_vehicle",-0.5526],["is_motorcycle",0.3533],["is_dui_alcohol",0.3497],["is_intersection",0.3285],["is_fixed_object",-0.3144],["is_dui_drugs",-0.3072],["is_multi_vehicle",0.2435],["area_Newton",0.215],["area_Rampart",0.1721],["area_Northeast",0.1478],["is_unlicensed",0.1366],["descent_B",0.1339],["descent_X",-0.1308],["sex_F",0.1298],["area_Hollenbeck",0.1206],["descent_H",0.0986],["area_Central",0.0962]]},
  "2018-2019-2020":{accuracy:0.8404,features:[["is_hit_and_run",-1.4603],["is_pedestrian",1.022],["is_bike",0.6221],["is_parked_vehicle",-0.5385],["area_Newton",0.447],["area_Rampart",0.4239],["area_Northeast",0.3672],["is_intersection",0.3421],["is_motorcycle",0.3309],["grid_34.05_-118.25",0.3073],["area_Central",0.3035],["area_Hollenbeck",0.2921],["is_dui_alcohol",0.2722],["grid_34.0_-118.25",0.2658],["is_fixed_object",-0.2657],["is_multi_vehicle",0.2603],["grid_34.05_-118.2",0.2187],["is_dui_drugs",-0.2121],["sex_F",0.1765],["descent_B",0.1699]]},
  "2018-2020-2021":{accuracy:0.6952,features:[["is_hit_and_run",-1.4181],["is_pedestrian",1.0043],["is_bike",0.6059],["is_parked_vehicle",-0.5421],["area_Newton",0.4236],["area_Rampart",0.4162],["area_Northeast",0.3464],["is_intersection",0.3262],["is_motorcycle",0.3217],["grid_34.05_-118.25",0.3071],["area_Central",0.2965],["is_fixed_object",-0.287],["is_dui_alcohol",0.2846],["area_Hollenbeck",0.2765],["is_multi_vehicle",0.2515],["grid_34.0_-118.25",0.2353],["is_dui_drugs",-0.2261],["grid_34.05_-118.2",0.1915],["grid_34.1_-118.25",0.1591],["descent_B",0.1568]]},
  "2018-2021-2022":{accuracy:0.6935,features:[["is_hit_and_run",-1.2727],["is_pedestrian",1.0286],["is_bike",0.6176],["is_parked_vehicle",-0.5373],["is_motorcycle",0.3338],["is_intersection",0.3329],["is_dui_alcohol",0.3247],["is_fixed_object",-0.3087],["area_Newton",0.2848],["is_dui_drugs",-0.2812],["is_multi_vehicle",0.2494],["area_Rampart",0.2396],["area_Northeast",0.2134],["area_Central",0.1679],["area_Hollenbeck",0.1549],["descent_B",0.1497],["sex_F",0.1403],["descent_X",-0.1283],["is_unlicensed",0.1273],["grid_34.0_-118.25",0.116]]},
  "2018-2022-2023":{accuracy:0.6987,features:[["is_hit_and_run",-1.1419],["is_pedestrian",1.0428],["is_bike",0.6246],["is_parked_vehicle",-0.5481],["is_dui_alcohol",0.3623],["is_motorcycle",0.3414],["is_intersection",0.3382],["is_fixed_object",-0.3233],["is_dui_drugs",-0.3092],["area_Newton",0.2371],["is_multi_vehicle",0.2269],["area_Rampart",0.1779],["area_Northeast",0.1553],["descent_B",0.147],["sex_F",0.1411],["is_unlicensed",0.1382],["area_Hollenbeck",0.1304],["descent_X",-0.1222],["area_Central",0.1133],["area_Hollywood",-0.1024]]},
  "2018-2023-2024":{accuracy:0.6948,features:[["is_pedestrian",1.0677],["is_hit_and_run",-1.0367],["is_bike",0.6261],["is_parked_vehicle",-0.5528],["is_dui_alcohol",0.3934],["is_motorcycle",0.3544],["is_intersection",0.34],["is_dui_drugs",-0.3306],["is_fixed_object",-0.3289],["is_multi_vehicle",0.2142],["area_Newton",0.1924],["area_Rampart",0.1442],["descent_B",0.1417],["is_unlicensed",0.1411],["sex_F",0.1409],["area_Northeast",0.1271],["descent_X",-0.1152],["area_Hollenbeck",0.1069],["descent_H",0.1018],["area_Hollywood",-0.0936]]},
  "2019-2020-2021":{accuracy:0.6965,features:[["is_hit_and_run",-1.386],["is_pedestrian",0.9847],["is_bike",0.5939],["is_parked_vehicle",-0.57],["area_Newton",0.4173],["area_Rampart",0.4058],["is_fixed_object",-0.3291],["area_Northeast",0.317],["is_intersection",0.3108],["is_dui_alcohol",0.3091],["grid_34.05_-118.25",0.3052],["is_motorcycle",0.305],["area_Central",0.2978],["area_Hollenbeck",0.2631],["is_dui_drugs",-0.2552],["grid_34.0_-118.25",0.2355],["is_multi_vehicle",0.2045],["grid_34.05_-118.2",0.1776],["sex_F",0.153],["descent_B",0.15]]},
  "2019-2021-2022":{accuracy:0.6984,features:[["is_hit_and_run",-1.1799],["is_pedestrian",1.0215],["is_bike",0.6109],["is_parked_vehicle",-0.5549],["is_dui_alcohol",0.3588],["is_fixed_object",-0.346],["is_intersection",0.3285],["is_motorcycle",0.3226],["is_dui_drugs",-0.3082],["area_Newton",0.2522],["is_multi_vehicle",0.2068],["area_Rampart",0.2012],["area_Northeast",0.1734],["area_Central",0.1512],["descent_B",0.1433],["sex_F",0.1403],["area_Hollenbeck",0.1339],["is_unlicensed",0.1218],["descent_X",-0.1167],["grid_34.0_-118.25",0.1057]]},
  "2019-2022-2023":{accuracy:0.7063,features:[["is_pedestrian",1.042],["is_hit_and_run",-1.0151],["is_bike",0.6209],["is_parked_vehicle",-0.5647],["is_dui_alcohol",0.4045],["is_fixed_object",-0.3555],["is_intersection",0.3399],["is_motorcycle",0.334],["is_dui_drugs",-0.3278],["area_Newton",0.2045],["is_multi_vehicle",0.1819],["sex_F",0.1449],["descent_B",0.1425],["area_Rampart",0.1425],["is_unlicensed",0.1339],["area_Northeast",0.1168],["area_Hollenbeck",0.1124],["descent_X",-0.1093],["descent_H",0.0963],["area_Central",0.096]]},
  "2019-2023-2024":{accuracy:0.707,features:[["is_pedestrian",1.0739],["is_hit_and_run",-0.8921],["is_bike",0.6224],["is_parked_vehicle",-0.5692],["is_dui_alcohol",0.4411],["is_fixed_object",-0.3565],["is_motorcycle",0.3515],["is_intersection",0.3439],["is_dui_drugs",-0.3429],["is_multi_vehicle",0.1696],["area_Newton",0.1587],["sex_F",0.1457],["descent_B",0.1369],["is_unlicensed",0.1363],["area_Rampart",0.1112],["descent_X",-0.1006],["descent_H",0.0974],["area_Northeast",0.0916],["is_weekend",0.0892],["area_Hollenbeck",0.0872]]},
  "2020-2021-2022":{accuracy:0.7076,features:[["is_pedestrian",1.0115],["is_hit_and_run",-0.9617],["is_bike",0.5827],["is_parked_vehicle",-0.5502],["is_dui_alcohol",0.4092],["is_fixed_object",-0.3658],["is_intersection",0.3304],["is_motorcycle",0.3163],["is_dui_drugs",-0.3149],["area_Newton",0.1899],["is_multi_vehicle",0.1874],["area_Rampart",0.1469],["area_Hollenbeck",0.1257],["descent_B",0.1204],["area_Northeast",0.1192],["is_unlicensed",0.1143],["descent_X",-0.1083],["sex_F",0.1048],["area_Central",0.104],["area_77th Street",-0.0888]]},
  "2020-2022-2023":{accuracy:0.7239,features:[["is_pedestrian",1.0421],["is_hit_and_run",-0.7514],["is_bike",0.5988],["is_parked_vehicle",-0.5685],["is_dui_alcohol",0.476],["is_fixed_object",-0.3681],["is_intersection",0.3488],["is_motorcycle",0.3357],["is_dui_drugs",-0.3197],["is_multi_vehicle",0.149],["area_Newton",0.1473],["descent_B",0.127],["is_unlicensed",0.1265],["sex_F",0.1249],["area_Hollenbeck",0.102],["descent_X",-0.0948],["area_Rampart",0.094],["is_weekend",0.0853],["vict_age",-0.0806],["area_77th Street",-0.0801]]},
  "2020-2023-2024":{accuracy:0.723,features:[["is_pedestrian",1.0836],["is_hit_and_run",-0.6171],["is_bike",0.6004],["is_parked_vehicle",-0.5817],["is_dui_alcohol",0.5222],["is_fixed_object",-0.3672],["is_motorcycle",0.361],["is_intersection",0.3517],["is_dui_drugs",-0.3256],["sex_F",0.1314],["is_multi_vehicle",0.1311],["is_unlicensed",0.1266],["descent_B",0.1221],["area_Newton",0.1048],["is_weekend",0.0881],["hour_of_day",0.0871],["vict_age",-0.0806],["descent_X",-0.0795],["descent_H",0.0755],["is_late_night",0.0748]]},
  "2021-2022-2023":{accuracy:0.7647,features:[["is_pedestrian",1.1082],["is_dui_alcohol",0.6742],["is_bike",0.6194],["is_parked_vehicle",-0.5984],["is_intersection",0.3905],["is_motorcycle",0.3861],["is_fixed_object",-0.3677],["is_dui_drugs",-0.2334],["is_hit_and_run",-0.2134],["sex_F",0.1401],["is_unlicensed",0.1327],["descent_B",0.1297],["vict_age",-0.1005],["hour_of_day",0.0965],["is_weekend",0.0867],["is_multi_vehicle",0.0791],["is_late_night",0.079],["area_Topanga",0.0751],["is_victory_blvd",0.0623],["grid_34.35_-118.45",0.0582]]},
  "2021-2023-2024":{accuracy:0.764,features:[["is_pedestrian",1.1453],["is_dui_alcohol",0.6981],["is_parked_vehicle",-0.6283],["is_bike",0.6108],["is_motorcycle",0.4129],["is_intersection",0.3777],["is_fixed_object",-0.3765],["is_dui_drugs",-0.2438],["is_hit_and_run",-0.1528],["sex_F",0.1467],["is_unlicensed",0.1275],["descent_B",0.1223],["hour_of_day",0.097],["is_weekend",0.0858],["vict_age",-0.0855],["area_Topanga",0.0698],["is_late_night",0.0694],["descent_H",0.0691],["sex_X",-0.0622],["is_victory_blvd",0.0619]]},
  "2022-2023-2024":{accuracy:0.7705,features:[["is_pedestrian",1.1761],["is_dui_alcohol",0.7374],["is_parked_vehicle",-0.6738],["is_bike",0.6194],["is_motorcycle",0.4458],["is_fixed_object",-0.3806],["is_intersection",0.3663],["is_dui_drugs",-0.2528],["sex_F",0.1667],["is_unlicensed",0.1322],["descent_B",0.1222],["hour_of_day",0.0889],["descent_H",0.0884],["is_weekend",0.0864],["vict_age",-0.0807],["is_late_night",0.0669],["area_Topanga",0.0636],["is_victory_blvd",0.0606],["area_Hollywood",-0.0541],["is_hit_and_run",-0.0539]]}
};

const YEARS = Array.from({ length: 15 }, (_, i) => 2010 + i);


const getEra = (trainStart, trainEnd, testYear) => {
  if (testYear <= 2020) return 'Pre-COVID Era';
  if (testYear <= 2021) return 'COVID Disruption';
  return 'Post-COVID Recovery';
};

const getEraDesc = (trainStart, trainEnd, testYear) => {
  if (testYear <= 2020) return 'Pre-COVID models show strong predictive accuracy. Collision patterns were stable.';
  if (testYear <= 2021) return 'COVID disrupted collision patterns. Empty roads led to higher speeds and new behaviors.';
  return 'Post-COVID stabilization. Recent-window models outperform 13-year historical models by ~8 points.';
};

// TEMPORARY: filter engineered neighborhood zones from display until sliding window
// compute is rerun without these features. Remove this set and filter after recompute.
const ENGINEERED_ZONES = new Set([
  'is_downtown', 'is_south_la', 'is_westside', 'is_east_la',
  'is_san_fernando_valley', 'is_coastal', 'is_freeway_adjacent',
]);

const HIDDEN_FEATURES = new Set([
  'hour_of_day',  // raw 0-23 hour; less interpretable than engineered time flags
  'vict_age',     // continuous raw field; ambiguous as a standalone predictor
  'descent_X',    // X = unknown/unrecorded descent — not a meaningful category
]);

const FeatureBars = ({ features }) => {
  const maxWeight = Math.max(...features.map(f => Math.abs(f[1])));
  return (
    <div className="feature-bars">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div className="result-label">Top Predictors by Model Weight</div>
        <div style={{ display: 'flex', gap: '0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', background: '#16A34A', borderRadius: '2px', flexShrink: 0 }} />
            lower injury probability
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', background: '#E02222', borderRadius: '2px', flexShrink: 0 }} />
            higher injury probability
          </span>
        </div>
      </div>
      {features.map((f, i) => (
        <div className="feature-bar-item" key={i}>
          <div className="feature-name">{f[0].replace(/_/g, ' ')}</div>
          <div className="feature-bar-track">
            <div
              className={`feature-bar-fill ${f[1] >= 0 ? 'positive' : 'negative'}`}
              style={{ width: `${(Math.abs(f[1]) / maxWeight) * 100}%` }}
            />
          </div>
          <div className="feature-weight" style={{ color: f[1] >= 0 ? 'var(--text-sec)' : 'var(--text-muted)' }}>
            {f[1] > 0 ? '+' : ''}{f[1].toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

const PredictionModel = () => {
  const navigate = useNavigate();
  const [trainStart, setTrainStart] = useState(2022);
  const [trainEnd,   setTrainEnd]   = useState(2023);
  const [testYear,   setTestYear]   = useState(2024);
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [showHint,       setShowHint]       = useState(false);
  const [highlightInputs, setHighlightInputs] = useState(false);
  const hintRef      = useRef(null);
  const highlightRef = useRef(null);

  const applyPreset = (start, end, test) => {
    setTrainStart(start);
    setTrainEnd(end);
    setTestYear(test);
    setResult(null);
    setShowHint(true);
    if (hintRef.current) clearTimeout(hintRef.current);
    hintRef.current = setTimeout(() => setShowHint(false), 2750);
    setHighlightInputs(true);
    if (highlightRef.current) clearTimeout(highlightRef.current);
    highlightRef.current = setTimeout(() => setHighlightInputs(false), 800);
  };

  const handleRun = () => {
    setError('');
    if (trainStart >= trainEnd)  { setError('Training end year must be after start year.'); return; }
    if (testYear  <= trainEnd)   { setError('Test year must be after training end year.'); return; }
    setLoading(true);
    setTimeout(() => {
      const key   = `${trainStart}-${trainEnd}-${testYear}`;
      const found = PRECOMPUTED[key];
      setResult(found
        ? { ...found, trainStart, trainEnd, testYear }
        : { notFound: true, trainStart, trainEnd, testYear }
      );
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ paddingTop: '3.75rem' }}>
      <section className="section page-hero" style={{ paddingTop: '5rem', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 style={{ marginBottom: '1.25rem', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Prediction Model Explorer</h1>
          <p style={{ marginBottom: '2rem', maxWidth: '62ch' }}>
            Choose a range of years to train the model on, then pick a test year to see
            how accurately it predicted injury outcomes on crashes it had never seen before.
            The feature weights below show what the model learned to rely on most.
          </p>
          <p style={{ marginBottom: '1rem', maxWidth: '62ch' }}>
            What do you notice about the model's accuracy when data after 2020 is used?
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <button
                onClick={() => applyPreset(2016, 2018, 2019)}
                style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--text)', cursor: 'pointer' }}
              >
                Test: Data before 2020
              </button>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                (2016–2018, test on 2019)
              </div>
            </div>
            <div>
              <button
                onClick={() => applyPreset(2021, 2023, 2024)}
                style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--text)', cursor: 'pointer' }}
              >
                Test: Data after 2020
              </button>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                (2021–2023, test on 2024)
              </div>
            </div>
          </div>

          <p style={{ marginBottom: '0.75rem', maxWidth: '62ch', fontSize: '0.95rem' }}>
            <strong>Accuracy:</strong> the share of test-year collisions the model correctly classified as injury or no injury out of crashes it had never seen during training.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="window-explorer">
            <div style={{ position: 'relative' }}>
              {showHint && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 0.5rem)',
                  right: 0,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: 'var(--text)',
                  }}>
                    Click here to run the model!
                  </span>
                  <div style={{ fontSize: '1.6rem', lineHeight: 1, color: 'var(--text)', marginTop: '0.1rem' }}>↓</div>
                </div>
              )}
            <div className="window-controls">
              <div className="input-group">
                <label>Train From <span style={{ textTransform: 'none', letterSpacing: 'normal', fontStyle: 'italic' }}>(select year)</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={trainStart} style={{ width: '100%', paddingRight: '2rem', background: highlightInputs ? '#dbeafe' : 'var(--bg)', borderColor: highlightInputs ? '#93c5fd' : 'var(--border)', transition: 'background 0.5s ease, border-color 0.5s ease' }} onChange={e => {
                    const ns = +e.target.value;
                    setTrainStart(ns);
                    if (ns >= trainEnd) {
                      setTrainEnd(ns + 1);
                      if (testYear <= ns + 1) setTestYear(ns + 2);
                    }
                  }}>
                    {YEARS.slice(0, -2).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.7rem' }}>▾</span>
                </div>
              </div>
              <div className="input-group">
                <label>Train To <span style={{ textTransform: 'none', letterSpacing: 'normal', fontStyle: 'italic' }}>(select year)</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={trainEnd} style={{ width: '100%', paddingRight: '2rem', background: highlightInputs ? '#dbeafe' : 'var(--bg)', borderColor: highlightInputs ? '#93c5fd' : 'var(--border)', transition: 'background 0.5s ease, border-color 0.5s ease' }} onChange={e => {
                    const ne = +e.target.value;
                    setTrainEnd(ne);
                    setTestYear(ne + 1);
                    if (ne <= trainStart) setTrainStart(ne - 1);
                  }}>
                    {YEARS.slice(1, -1).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.7rem' }}>▾</span>
                </div>
              </div>
              <div className="input-group">
                <label>Test Year <span style={{ textTransform: 'none', letterSpacing: 'normal', fontStyle: 'italic' }}>(automatically adjusts)</span></label>
                <div style={{ background: '#f5f5f3', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.55rem 0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', userSelect: 'none' }}>
                  {testYear}
                </div>
              </div>
              <button className="btn" style={{ alignSelf: 'end' }} onClick={handleRun} disabled={loading}>
                {loading ? 'Loading…' : 'Run Model'}
              </button>
            </div>
            </div>

            {error && (
              <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                {error}
              </p>
            )}

            {result && result.notFound && (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                This combination is not in the precomputed set. The test year must be the year immediately after train end.
                Try: Train 2022 → 2023, Test 2024.
              </p>
            )}

            {result && !result.notFound && (
              <>
                <div className="results-grid">
                  <div className="result-card">
                    <div className="result-label">Test Accuracy</div>
                    <div className="result-value">
                      {(result.accuracy * 100).toFixed(1)}%
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.65rem', maxWidth: 'none', color: 'var(--text-muted)' }}>
                      Trained {result.trainStart}–{result.trainEnd}, tested on {result.testYear}
                    </p>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Era</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, marginTop: '0.2rem' }}>
                      {getEra(result.trainStart, result.trainEnd, result.testYear)}
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.65rem', maxWidth: 'none', color: 'var(--text-muted)' }}>
                      {getEraDesc(result.trainStart, result.trainEnd, result.testYear)}
                    </p>
                  </div>
                </div>
                <FeatureBars features={result.features.filter(f => !ENGINEERED_ZONES.has(f[0]) && !f[0].startsWith('grid_') && !HIDDEN_FEATURES.has(f[0])).slice(0, 15)} />
              </>
            )}
          </div>

          {/* Explanation */}
          <div className="explanation-grid" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="card">
              <h4 style={{ marginBottom: '0.6rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>How to read feature weights</h4>
              <p style={{ maxWidth: 'none', fontSize: '0.9rem' }}>
                A <strong>positive weight</strong> means that feature is associated with higher injury probability.
                A <strong>negative weight</strong> means it is associated with lower injury probability.
                Weight magnitude indicates influence on the prediction.
              </p>
            </div>
            <div className="card">
              <h4 style={{ marginBottom: '0.6rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>About the windows</h4>
              <p style={{ maxWidth: 'none', fontSize: '0.9rem' }}>
                Each window trains the model only on collisions from the selected year range, then
                tests it on the immediately following year — data the model has never seen. Before
                training, all features are rescaled to a common scale so that large-range inputs
                (like victim age) do not dominate small binary ones (like is_hit_and_run). This means
                the weights within a single window are internally consistent and directly comparable
                to each other, but a weight from one window should not be compared numerically to the
                same weight from a different window, since each window's scaling is fit independently.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => navigate('/crash-scenario-explorer')}
              style={{
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Click to compare scenarios
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PredictionModel;
