export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/account',
        component: '../layouts/UserLayout',
        routes: [
          { path: '/account', redirect: '/account/login' },
          {
            name: 'login',
            path: '/account/login',
            component: './User/login',
          },
          {
            name: 'register-result',
            icon: 'smile',
            path: '/account/register-result',
            component: './User/register-result',
          },
          {
            name: 'register',
            icon: 'smile',
            path: '/account/register',
            component: './User/register',
          },
          {
            name: 'forgot-password',
            icon: 'smile',
            path: '/account/forgot-password',
            component: './User/forgot-password',
          },
          {
            component: '404',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            component: '../layouts/BasicLayout',
            authority: ['admin', 'user'],
            routes: [
              {
                path: '/',
                redirect: '/location',
              },
              // {
              //   path: '/welcome',
              //   name: 'welcome',
              //   icon: 'smile',
              //   component: './Welcome',
              // },
              // {
              //   name: 'list.brand-list',
              //   icon: 'TagsFilled',
              //   path: '/brand',
              //   component: './Brand',
              // },
              {
                name: 'list.location-list',
                icon: 'RadarChartOutlined',
                path: '/location',
                component: './Location',
              },
              
              {
                name: 'list.device-list',
                icon: 'FundProjectionScreen',
                path: '/devices',
                component: './Device',
              },
              {
                name: 'list.media-list',
                icon: 'PictureOutlined',
                path: '/medias',
                component: './Media',
              },
              {
                name: 'list.playlist-list',
                icon: 'PlaySquareOutlined',
                path: '/playlist',
                component: './Playlist',
              },
              {
                name: 'list.scenario-list',
                icon: 'ContainerOutlined',
                path: '/scenario',
                component: './Scenario',
              },
              {
                name: 'list.campaign-list',
                icon: 'GlobalOutlined',
                path: '/campaign',
                component: './Campaign',
              },
              {
                path: "/profile",
                name: "profile",
                icon: "profile",
                component: './profile/wallet'
                // routes: [
                //    {
                //     path: '/',
                //     redirect: '/profile/infor',
                //   },
                //   {
                //     name: 'information',
                //     icon: 'smile',
                //     path: '/profile/infor',
                //     component: './profile/information',
                //   },
                //   {
                //     name: 'wallet',
                //     icon: 'smile',
                //     path: '/profile/wallet',
                //     component: './profile/wallet',
                //   },
                // ]
              },
              {
                component: './404',
              },
            ],
          },
          {
            icon: 'warning',
            path: '/exception',
            name: 'exception',
            routes: [
              {
                path: '/',
                redirect: '/exception/403',
              },
              {
                name: '403',
                icon: 'smile',
                path: '/exception/403',
                component: './exception/403',
              },
              {
                name: '404',
                icon: 'smile',
                path: '/exception/404',
                component: './exception/404',
              },
              {
                name: '500',
                icon: 'smile',
                path: '/exception/500',
                component: './exception/500',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
