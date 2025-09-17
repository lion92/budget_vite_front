import {create} from "zustand";
import lien from "./pages/components/lien";

export const useAppStore = create(async () => {


    const fetchAPICat = async () => {
        let idUser = parseInt("" + localStorage.getItem("utilisateur"))
        let getyear = parseInt("" + localStorage.getItem("year"))
        if (isNaN(getyear)) {
            return
        }
        let tabMois = []
        for (let i = 1; i < 13; i++) {
            const response1 = await fetch(lien.url + "action/categorie/sum/byUser/" + idUser + "/" + i + "/" + getyear)
            tabMois.push(response1)
        }

        await console.log(tabMois)
        return tabMois;

    }
    return ({
        mois: await fetchAPICat()
    });
})