import React, {useCallback, useEffect, useState} from "react";
import lien from './lien'

export default function SelectCategorie(props) {
    let [valueOption, setValueOption] = useState("");
    let [textp, setText] = useState([]);

    //////////////////////////appel api en debut
    useEffect(() => {
        fetchAPI();
    }, []);

    const fetchAPI = useCallback(async () => {
        let idUser = parseInt("" + localStorage.getItem("utilisateur"))
        const response = await fetch(lien.url + "categorie/byuser/" + idUser);
        const resbis = await response.json();
        await setText(resbis);

        return resbis;
    }, [setText]);

    return (
        <>

            <select onClick={fetchAPI}>
                <option>Please choose one option</option>
                {textp.map((option, index) => {
                    return <option onClick={() => {
                        fetchAPI();
                        props.categorie(props.id);
                    }} key={option.id}>
                        {option.id + " " + option.categorie}

                    </option>
                })}
            </select>

        </>)

}
