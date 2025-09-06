import CapModule from '#capModule';
import axios from "axios";


export default class useCharity {

    //#region getDeceased
    public getDeceased = async (id:string,tenant:number) => {
        try {
        let url = "";
        if (CapModule.extra && CapModule.extra.length > 0) {
            let setting = CapModule.extra.find((it:any)=>it.Tenant == tenant)
            if (setting) {
                url = `${setting.URL}/services/app/Deceaseds/GetDeceasedForShop`;
                const data = await axios.get(url, {
                    headers: {"abp.tenantid": setting.Tenant},
                    params: {deceasedCode: id}
                });
                if (data.data){
                    return {result: true, msg: 'Success', data : data.data}
                }else{
                    return {result: false, msg: 'پاسخ مناسب از سرور دریافت نشد'}
                }
            }else{
                return {result: false, msg: 'تنظیمات یافت نشد'}
            }
        }else{
            return {result: false, msg: 'دسترسی به تنظیمات وجود ندارد'}
        }
        } catch (e) {
            return {result: false, msg: 'مشکلی پیش آمده است'}
        }
    }
    //#endregion

    //#region getMessages
    public getMessages = async (id:string,tenant:number) => {
        try {
            let url = "";
            if (CapModule.extra && CapModule.extra.length > 0) {
                let setting = CapModule.extra.find((it:any)=>it.Tenant == tenant)
                if (setting) {
                    url = `${setting.URL}/services/app/CondolenceMessages/GetCondolenceMessagesForShop`;
                    const data = await axios.get(url, {
                        headers: {"abp.tenantid": setting.Tenant},
                        params: {
                            deceasedCode: id,
                            filter: null,
                            maxResultCount: 999,
                            page: 1,
                        }
                    });
                    if (data.data){
                        return {result: true, msg: 'Success', data : data.data}
                    }else{
                        return {result: false, msg: 'پاسخ مناسب از سرور دریافت نشد'}
                    }
                }else{
                    return {result: false, msg: 'تنظیمات یافت نشد'}
                }
            }else{
                return {result: false, msg: 'دسترسی به تنظیمات وجود ندارد'}
            }
        } catch (e) {
            return {result: false, msg: 'مشکلی پیش آمده است'}
        }
    }
    //#endregion

    //#region getFlowers
    public getFlowers = async (id:string,tenant:number) => {
        try {
            let url = "";
            if (CapModule.extra && CapModule.extra.length > 0) {
                let setting = CapModule.extra.find((it:any)=>it.Tenant == tenant)
                if (setting) {
                    url = `${setting.URL}/services/app/Deceaseds/GetAllFlowerCrownForDeceased`;
                    const data = await axios.get(url, {
                        headers: {"abp.tenantid": setting.Tenant},
                        params: {
                            deceasedCode: id,
                            maxResultCount: 999,
                            SkipCount: 0,
                        }
                    });
                    if (data.data){
                        return {result: true, msg: 'Success', data : data.data}
                    }else{
                        return {result: false, msg: 'پاسخ مناسب از سرور دریافت نشد'}
                    }
                }else{
                    return {result: false, msg: 'تنظیمات یافت نشد'}
                }
            }else{
                return {result: false, msg: 'دسترسی به تنظیمات وجود ندارد'}
            }
        } catch (e) {
            return {result: false, msg: 'مشکلی پیش آمده است'}
        }
    }
    //#endregion

    //#region getFlowerDetail
    public getFlowerDetail = async (id:string,tenant:number) => {
        try {
            let url = "";
            if (CapModule.extra && CapModule.extra.length > 0) {
                let setting = CapModule.extra.find((it:any)=>it.Tenant == tenant)
                if (setting) {
                    url = `${setting.URL}/services/app/Deceaseds/GetFlowerCrownDetailForDeceased`;
                    const data = await axios.get(url, {
                        headers: {"abp.tenantid": setting.Tenant},
                        params: {
                            billCode: id,
                        }
                    });
                    if (data.data){
                        return {result: true, msg: 'Success', data : data.data}
                    }else{
                        return {result: false, msg: 'پاسخ مناسب از سرور دریافت نشد'}
                    }
                }else{
                    return {result: false, msg: 'تنظیمات یافت نشد'}
                }
            }else{
                return {result: false, msg: 'دسترسی به تنظیمات وجود ندارد'}
            }
        } catch (e) {
            return {result: false, msg: 'مشکلی پیش آمده است'}
        }
    }
    //#endregion
}
