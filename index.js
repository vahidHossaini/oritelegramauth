var uuid=require("uuid");
var TelegramBot = require('node-telegram-bot-api');
module.exports = class telegramAuthIndex
{
	constructor(config,dist)
	{
		this.config=config.statics
		this.context=this.config.context 
        this.bootstrap=require('./bootstrap.js')
        this.enums=require('./struct.js') 
        this.tempConfig=require('./config.js')
		//global.acc=new accountManager(dist)
		this.codeLength=5
		if(this.config.codeLength)this.codeLength=this.config.codeLength
        if(this.config.captchaContext)
           this.ccontext=this.config.captchaContext
        this.runTelegram(this.config);
	}
    async onGetMessage(msg)
    {
        var id = msg.from.id;
        if(msg.contact)
        {
            if(id!=msg.contact.user_id)
            {
                bot.sendMessage(msg.from.id,'Share Your Phone Number',{
                    "parse_mode": "Markdown",
                    "reply_markup": {
                        "one_time_keyboard": true,
                        "keyboard": [[{
                            text: "My phone number",
                            request_contact: true
                        }] ]
                    }
                })
                
            }
            else
            {
                await global.db.Save(self.context,'telegramauth_ids',{where:{_id:msg.from.id,phone:msg.contact.phone_number,name:msg.contact.Mohadeseh}});
                var code = await global.db.SearchOne(self.context,'telegramauth_code',{where:{phone:msg.contact.phone_number}});
                if(!code)
                {
                    bot.sendMessage(msg.from.id,'First Go Application',{
                        "parse_mode": "Markdown", 
                    })
                    return;
                }
                
                bot.sendMessage(msg.from.id,'YourCode is : '+code.code,{
                    "parse_mode": "Markdown",
                    "reply_markup": {
                        "one_time_keyboard": true,
                        "keyboard": [[{
                            text: "My phone number",
                            request_contact: true
                        }] ]
                    }
                })
            }
            return;
        }
        
        
		var user = await global.db.SearchOne(self.context,'telegramauth_ids',{where:{_id:msg.from.id}});
        if(user)
        {
        
            var code = await global.db.SearchOne(self.context,'telegramauth_code',{where:{phone:user.phone}});
            if(!code)
            {
                bot.sendMessage(msg.from.id,'First Go Application',{
                    "parse_mode": "Markdown", 
                })
                return;
            }
            
            bot.sendMessage(msg.from.id,'YourCode is : '+code.code,{
                "parse_mode": "Markdown",
                "reply_markup": {
                    "one_time_keyboard": true,
                    "keyboard": [[{
                        text: "My phone number",
                        request_contact: true
                    }] ]
                }
            })
        }
        else
        {
            bot.sendMessage(msg.from.id,'Share Number',{
                "parse_mode": "Markdown",
                "reply_markup": {
                    "one_time_keyboard": true,
                    "keyboard": [[{
                        text: "My phone number",
                        request_contact: true
                    }] ]
                }
            })
            
        }
    }
    runTelegram(config)
    {
        var bot = new TelegramBot(config.apiKey, { polling: true });
       // bot.on('inline_query',(msg)=>{ this.onInlineQuery(msg)})
        bot.on('message', (msg)=>{
            this.onGetMessage(msg)
        })
        // bot.on('callback_query',(msg)=>{
            // this.onCallbackQuery(msg)
        // }  )
        
    }
	async login(msg,func,self)
    {
        var dt=msg.data;
        if(this.ccontext)
        {
            var a = await global.captcha.validate(dt.captcha)
            if(!a)
                return func({m:"smsauth001"})
            
        }
		var code = await global.db.SearchOne(self.context,'telegramauth_code',{where:{phone:dt.phone}});
		if(code)
		{ 
			if(code.send>3)
			{
				if(!code.sendTime)code.sendTime=self.getExpTime(10);
				if(code.sendTime>new Date())
					return func({m:"smsauth003"});	
				code.send = 0
			}
		}
		else
		{
			code={}
			code._id = uuid.v4();
			code.submitDate = new Date();
			code.send=0;
			code.phone=dt.phone
		}
		code.expireDate =self.getExpTime(2);
		code.code = global.ori.RandomInt(self.codeLength) 
		code.send++;
		code.len = 0; 
        
		await global.db.Save(self.context,'telegramauth_code',['_id'],code);
		return func(null,{})
    }
	async verify(msg,func,self)
    {
        var dt=msg.data;
		var code = await global.db.SearchOne(self.context,'telegramauth_code',{where:{phone:dt.phone}});
		if(!code)
		{
			return func({m:"smsauth002"})
		}
		if(code.code!=dt.code)
		{
			if(code.len>3)
			{
				return func({m:"smsauth004"});
			}
			code.len++;
			await global.db.Save(self.context,'telegramauth_code',['_id'],code);
			return func({m:"smsauth005"});
		}		
        var acc = await global.acc.existAccount({$filter:"phones/number eq '"+dt.phone+"'"});
		var userid = uuid.v4();
		var roles=await global.db.SearchOne(self.context,'global_options',{where:{name:'telegramauth_role'}});
		if(!roles)
			roles={role:0}
		if(acc.value.length)
		{
			userid=acc.value[0].id
			var r=acc.value[0].roles
			roles.role=r|roles.role; 
			await global.acc.update(userid,'roles',roles.role);
		}
		else
		{ 
			await global.acc.create(userid,roles.role);
			await global.acc.update(userid,'phones',[{number:dt.phone}]);
		}
		
		return func (null,{session:[
				{name:'userid',value:userid},
				{name:'type',value:'telegramAuth'},
				{name:'roles',value:roles.role},
			] 
		  })
    }
	async isLogin(msg,func,self)
	{ 
		return func(null,{});
	}
}