









export  const logger = async  (user,action,resource,otherData,logType,prisma)=>{

//get user from db

const activeUser = await prisma.user.findFirst({
    where:{
        kcId:user.id
    }
})




// CREATE LOG FOR THE USER IN DB
const log = await prisma.Logs.create({
    data:{
        user:{
            connect:{
                id:activeUser.id
            }
        },
        action:action,
        resource:resource,
        additionalDetails:otherData,
        type:logType

    }
})


}
