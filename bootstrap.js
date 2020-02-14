module.exports = class telegramAuthBootstrap{
  constructor(config)
  {
    this.funcs=[
      {
          name:'login',
          title:'login with mobile number' ,
          inputs:[
			{
				name:'phone',
				type:'string',
				nullable:false
			}
          ]
      }, 
      {
          name:'verify',
          title:'verify with mobile number' ,
          inputs:[
			{
				name:'code',
				type:'string',
				nullable:false
			}
          ]
      }, 
      {
          name:'isLogin',
      }, 
	  
	   
    ]
    this.auth=[ 
            {
                name: 'isLogin',
                role: 'login'
            },
        ]
  }
}