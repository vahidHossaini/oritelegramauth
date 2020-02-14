module.exports = class telegramAuthConfig
{
    constructor(config)
    { 
         
    }
    getPackages()
    {
       return [
       {name:"uuid"},
       {name:"node-telegram-bot-api"},
       ]
    }
    getMessage()
	{
		return{
			default001:"user not exist", 
		}
	}
    getVersionedPackages()
    { 
      return []
    }
    getDefaultConfig()
    {
      return {
		apiKey:"",   
		 
      }
    }
}