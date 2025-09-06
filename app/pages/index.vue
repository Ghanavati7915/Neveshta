<script setup lang="ts">
//#region Import
import CapModule from '#capModule';
import useCharity from "~/composables/useCharity";
//#endregion

//#region Instance
const api = new useCharity();
const route = useRoute()
//#endregion

//#region variables
const showErrorPage = ref<any>({
  state:false,
  message:'',
})
const loading = ref<boolean>(true)
const interval = ref<any>(null);
const intervalUpdate = ref<any>(null);
const intervalForce = ref<any>(null);
const screen = ref<any[]>([]) //Types : gallery - clip - flower
const messages = ref<any[]>([{
  from : 'انجمن مددکاری امام زمان (عج)',
  avatar : '/img/logo.png',
  message : 'انجمن مددکاری امام زمان عجل الله تعالی فرجه الشریف، ضمن عرض تسلیت فقدان این شتافته به دیار باقی، از درگاه ربوبی، همنشینی با اهل بیت علیهم السلام برای آن عزیز و شکیبائی و پاداش اخروی برای کانون مصیبت، استدعا دارد.',
}])
const messagesForce = ref<any[]>([])
const person = ref<any>(null);
const currentScreen = ref<any>(null);
const currentForceMessage = ref<any>(null);
const currentScreenIndex = ref<number>(0);
const screenChangeInterval = ref<number>(4);
const messageInterval = ref<number>(10);
const newMessageInterval = ref<number>(10);
//#endregion

//#region functions
const getDeceased = async () => {
  const {result, data} = await api.getDeceased(route.query.code,route.query.tenant)
  if (result){
    if (data.result.deceased){
      person.value = {
        firstname : data.result.deceased.firstName,
        lastname : data.result.deceased.lastName,
        bio : data.result.deceased.description,
        avatar : data.result.deceased.imagePath,
        gender : data.result.deceased.gender,
      }
    }
    screen.value = [];
    if (data.result.pictureGallery.length > 0){
      data.result.pictureGallery.forEach((it:any)=>{
        screen.value.push({
          type : 'gallery',
          url : it,
        })
      })
    }
  }
  else {
    showErrorPage.value.state = true;
    showErrorPage.value.message = result.msg ? result.msg : 'پاسخ مناسب از سرور دریافت نشد';
  }
  await getMessages();
  await readyForShow();
  await getFlowers();
}
const getMessages = async () => {
  const {result, data} = await api.getMessages(route.query.code,route.query.tenant)
  if (result){
    data.result.items.forEach((it:any)=>{
      let check = messages.value.find(ix=>ix.from == it.name && ix.message == it.message )
      if(!check){
        messagesForce.value.push({
          from : it.name,
          avatar : it.image,
          message : it.message,
          expire : newMessageInterval.value
        })
        messages.value.push({
          from : it.name,
          avatar : it.image,
          message : it.message,
        })
      }
    })
  }
}
const getFlowers = async () => {
  const {result, data} = await api.getFlowers(route.query.code,route.query.tenant)
  if (result){
    for (const it of data.result.deceasedFlowerCrowns.items) {
      if (it.type === 'video') {
        messages.value.push({
          from: it.benefactorName,
          avatar: '',
          message: 'عرض تسلیت ( تهیه کلیپ تسلیت )',
        })

        // اگر نیاز داری کلیپ رو هم به screen اضافه کنی، این بخش رو فعال کن:
        // screen.value.push({
        //   type: 'clip',
        //   title: it.benefactorName,
        //   creator: '',
        //   url: it.flowerCrownImagePath,
        // })
      } else if (it.type === 'image') {
        try {
          const response = await api.getFlowerDetail(it.billCode, route.query.tenant)

          screen.value.push({
            type: 'flower',
            title: it.benefactorName,
            code: it.billCode,
            url: it.flowerCrownImagePath,
            paper: response.result ? response.data.result.flowerCrown : null,
          })
        } catch (error) {
          console.error('خطا در دریافت جزئیات گل:', error)
          screen.value.push({
            type: 'flower',
            title: it.benefactorName,
            code: it.billCode,
            url: it.flowerCrownImagePath,
            paper: null,
          })

        }
      }
    }
  }
}

const taker = ref(1)
const fakeForce = () =>{
  messagesForce.value.push({
    from : `سهراب ${taker.value}`,
    avatar : '',
    message : ` درود بر شما --- ${taker.value} ---`,
    expire : newMessageInterval.value
  })

  taker.value++;
}
const checkForceMessage = async () => {

  if (currentForceMessage.value){
    if (currentForceMessage.value.expire == 0){
      currentForceMessage.value = null;
    } else {
      currentForceMessage.value.expire = +currentForceMessage.value.expire - 1;
    }
  }
  else {
    if ( messagesForce.value.length > 0 ){
      currentForceMessage.value = messagesForce.value[0];
      messagesForce.value = messagesForce.value.splice(1, messagesForce.value.length);
      console.log('messagesForce.value : ' , messagesForce.value)
    }
  }


  // if ( messagesForce.value.length>0){
  //   // کاهش مقدار expire و حذف آیتم‌هایی که expire آن‌ها صفر شده
  //   messagesForce.value = messagesForce.value
  //       .map(item => ({ ...item, expire: item.expire - 1 })) // کم کردن expire
  //       .filter(item => item.expire > 0); // نگه‌داشتن فقط آیتم‌هایی که expire مثبت دارند
  // }
}

const readyForShow = async () => {
  //#region SetFirstContent
  if (screen.value.length > 0){
    currentScreen.value = screen.value[0];
  }
  //#endregion

  loading.value = false;

  //#region Change Screen
  interval.value = setInterval(() => {
    if (currentScreenIndex.value < screen.value.length-1) {
      currentScreenIndex.value++;
    } else {
      currentScreenIndex.value = 0;
    }
    currentScreen.value = screen.value[currentScreenIndex.value];
  }, screenChangeInterval.value * 1000);
  //#endregion

  //#region Read Messages
  intervalUpdate.value = setInterval(async () => {
    await getMessages();
  }, messageInterval.value * 1000);
  //#endregion

  //#region Interval Force Message
  intervalForce.value = setInterval(async () => {
    await checkForceMessage();
  }, 1000);
  //#endregion
}
//#endregion

//#region constructors
onMounted(async () => {
  if (CapModule.extra && CapModule.extra.length > 0) {
    let setting = CapModule.extra.find((it:any)=>it.Tenant == 0)
    if (setting){
      screenChangeInterval.value = setting.ScreenInterval;
      messageInterval.value = setting.MessageInterval;
      newMessageInterval.value = setting.NewMessageInterval;
    }
  }
  if (route.query && route.query.code && route.query.tenant) {
    await getDeceased();
  }
  else{
    showErrorPage.value.state = true;
    showErrorPage.value.message = 'اطلاعات ورودی ناقص است ؛ شناسه متوفی و حوزه کاری را ارسال کنید';
  }
});
onBeforeRouteLeave(async () => {
  clearInterval(interval.value);
  clearInterval(intervalForce.value);
  clearInterval(intervalUpdate.value);
  clearInterval(messageInterval.value);
});
//#endregion
</script>

<template>
  <div>
    <!--#region mainBody-->
    <div v-if="!showErrorPage.state && !loading">
      <div class="w-full flex flex-col gap-3">
        <!--#region header-->
        <div class="w-full h-[10vh] flex dir-rtl">
          <div class="w-[10%] h-full pl-2">
            <card>
              <img v-if="person.avatar" :src="person.avatar" class="w-full h-full object-contain"/>
              <img v-else src="/img/sample.jpg" class="w-full h-full object-contain"/>
            </card>
          </div>
          <div class="w-[80%] h-full">
            <card class="flex-col">
              <div class="dir-rtl mb-4">
                <span v-if="person.gender == 1"> مرحوم </span>
                <span v-if="person.gender == 2"> مرحومه </span>
                <span class="mx-5 Estedad_FD_Bold"> {{person.firstname}} {{person.lastname}}</span>
              </div>
              <NuxtMarquee direction="right" speed="10" gradient gradient-color="#212327" class=" overflow-hidden">
                <div class="dir-ltr">
                  <span class="mx-5 Estedad_FD_Bold"> {{person.bio}} </span>
                </div>
              </NuxtMarquee>
            </card>
          </div>
          <div class="w-[10%] h-full pr-2">
            <card>
              <div class="w-full flex items-center justify-center text-center flip-3d">
                <div class="flip-inner m-auto">
                  <div class="front"><img alt="logo" src="/img/logo.png" class="w-full h-full object-contain" ></div>
                  <div class="back"><img alt="logo" src="/img/logo.png" class="w-full h-full object-contain" ></div>
                </div>
              </div>
            </card>
          </div>
        </div>
        <!--#endregion-->

        <!--#region FlowerBox-->
        <div v-if="currentScreen && currentScreen.type == 'flower'" class="w-full grid grid-cols-12 justify-center items-center gap-3">
          <!--#region flower-->
          <div class="col-span-4 h-[70vh] flex justify-center items-center">
            <card>
              <img :src="currentScreen.url" class="w-full h-full rounded-lg" alt="Flower"/>
            </card>
          </div>
          <!--#endregion-->
          <!--#region paper-->
          <div class="col-span-8 h-[70vh] flex justify-center items-center">
            <card>
              <img :src="currentScreen.paper" class="w-full h-full object-fill rounded-lg" alt="paper"/>
            </card>
          </div>
          <!--#endregion-->
        </div>
        <!--#endregion-->

        <!--#region Gallery-->
        <div v-if="currentScreen && currentScreen.type == 'gallery'" class="w-full grid grid-cols-12 justify-center items-center gap-3">
          <div class="col-span-12 h-[70vh] flex justify-center items-center">
            <card>
              <img :src="currentScreen.url" class="w-full h-full object-contain rounded-lg" alt="gallery"/>
            </card>
          </div>
        </div>
        <!--#endregion-->

        <!--#region footer-->
        <div class="w-full h-[15vh]">
          <card>
            <NuxtMarquee direction="right" speed="50" gradient gradient-color="#212327" class="overflow-hidden">
              <div v-for="(it,i) in messages" :key="i" class="flex gap-x-4 justify-center items-center dir-rtl mx-20">
                <div class="flex flex-col justify-center items-center">
                  <img :src="it.avatar ? it.avatar : '/img/avatar.png'" class="w-20 h-20 object-fit rounded-full"/>
                  <span class="text-xl mt-2">{{it.from}} </span>
                </div>
                <span class="text-4xl">{{it.message}}</span>
              </div>
            </NuxtMarquee>
          </card>
        </div>
        <!--#endregion-->

        <!--#region force footer-->
        <div class="w-[98vw] fixed -bottom-[20vh] left-[1vw] h-[15vh] transition-all ease-in-out duration-1000" style="z-index: 999999;" :class="[{'!bottom-[0vh]' : currentForceMessage}]">
          <card>
            <NuxtMarquee direction="right" speed="85" gradient gradient-color="#212327" class="overflow-hidden">
              <div class="flex gap-x-4 justify-center items-center dir-rtl mx-20">
                <div class="flex flex-col justify-center items-center">
                  <img :src="currentForceMessage.avatar ? currentForceMessage.avatar : '/img/avatar.png'" class="w-20 h-20 object-fit rounded-full"/>
                  <span class="text-xl mt-2">{{currentForceMessage.from}} </span>
                </div>
                <span class="text-4xl">{{currentForceMessage.message}}</span>
              </div>
            </NuxtMarquee>
          </card>
        </div>
        <!--#endregion-->
      </div>
    </div>
    <!--#endregion-->


<!--    <div class="fixed top-0 left-0 rounded-full p-5 items-center justify-center flex text-white bg-amber-500 cursor-pointer" @click="fakeForce"> FORCE </div>-->


    <!--#region Error Box-->
    <div v-if="showErrorPage.state" class="fixed top-0 left-0 w-screen h-screen Estedad_FD_Bold text-4xl bg-rose-500 text-rose-900 flex justify-center items-center animate-pulse">
      {{showErrorPage.message}}
    </div>
    <!--#endregion-->

    <!--#region Loading Box-->
    <div v-if="loading && !showErrorPage.state" class="fixed top-0 left-0 w-screen h-screen Estedad_FD_Bold text-4xl bg-slate-800 text-slate-200 flex justify-center items-center animate-pulse">
      در حال دریافت اطلاعات ؛ شکیبا باشید ...
    </div>
    <!--#endregion-->

  </div>

</template>

<style scoped>
.flip-3d {
  perspective: 1000px;
  display: inline-block;
}

.flip-inner {
  position: relative;
  width: 80px;   /* ابعاد دلخواه */
  height: 80px;
  transform-style: preserve-3d;
  animation: flipY 10s linear infinite;
}

.front, .back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  backface-visibility: hidden; /* این باعث میشه متن آینه‌ای نشه */
}

.front {
}

.back {
  transform: rotateY(180deg); /* پشت رو درست و بدون آینه نمایش بده */
}

@keyframes flipY {
  0%, 100% { transform: rotateY(0deg); }
  50%      { transform: rotateY(180deg); }
}

@media (prefers-reduced-motion: reduce) {
  .flip-inner { animation: none; }
}
</style>