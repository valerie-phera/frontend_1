// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";

// import PersonalData from "../../components/PersonalData/PersonalData";
// import BottomBlock from "../../components/BottomBlock/BottomBlock";
// import Button from "../../components/Button/Button";
// import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
// import Container from "../../components/Container/Container";

// import styles from "./AddDetailsPage.module.css";

// const AddDetailsPage = () => {
//     const navigate = useNavigate();
//     const { state } = useLocation();
//     const phValue = state?.phValue;
//     const phLevel = state?.phLevel;
//     const timestamp = state?.timestamp;
//     const interpretation = state?.interpretation;
//     const recommendations = state?.recommendations;

//     // Pre-fill user details if they were passed from the previous screen
//     // Otherwise initialize with empty/default values
//     const [age, setAge] = useState(state?.age || "");
//     const [ethnicBackground, setEthnicBackground] = useState(state?.ethnicBackground || []);
//     const [menstrualCycle, setMenstrualCycle] = useState(state?.menstrualCycle || []);
//     const [hormoneDiagnoses, setHormoneDiagnoses] = useState(state?.hormoneDiagnoses || []);
//     const [birthControl, setBirthControl] = useState(
//         state?.birthControl || {
//             general: null,
//             pill: null,
//             iud: null,
//             otherHormonalMethods: null,
//             permanentMethods: null,
//         }
//     );
//     const [hormoneTherapy, setHormoneTherapy] = useState(
//         state?.hormoneTherapy || {
//             general: null,
//             hormoneReplacement: []
//         }
//     );
//     const [fertilityJourney, setFertilityJourney] = useState(
//         state?.fertilityJourney || {
//             currentStatus: null,
//             fertilityTreatments: []
//         }
//     );
//     const [discharge, setDischarge] = useState(state?.discharge || []);
//     const [vulvaCondition, setVulvaCondition] = useState(state?.vulvaCondition || []);
//     const [smell, setSmell] = useState(state?.smell || []);
//     const [urination, setUrination] = useState(state?.urination || []);
//     const [notes, setNotes] = useState(state?.notes || "");

//     return (
//         <>
//             <div className={styles.content} data-scroll-container>
//                 <Container>
//                     <div className={styles.containerInner}>
//                         <div className={styles.heading}>
//                             <h1 className={styles.title}>To help us give you more accurate and meaningful insights, please select what best describes you.</h1>
//                             <p className={styles.privacyPolicy}>
//                                 We process your responses in real time only to provide context for your result. They are not stored. You can read more in our <a href="#">Privacy Policy</a>.
//                             </p>
//                         </div>
//                         <div className={styles.personalData}>
//                             {/* Main form component where user selects personal details */}
//                             <PersonalData
//                                 age={age}
//                                 setAge={setAge}
//                                 ethnicBackground={ethnicBackground}
//                                 setEthnicBackground={setEthnicBackground}
//                                 menstrualCycle={menstrualCycle}
//                                 setMenstrualCycle={setMenstrualCycle}
//                                 hormoneDiagnoses={hormoneDiagnoses}
//                                 setHormoneDiagnoses={setHormoneDiagnoses}
//                                 birthControl={birthControl}
//                                 setBirthControl={setBirthControl}
//                                 hormoneTherapy={hormoneTherapy}
//                                 setHormoneTherapy={setHormoneTherapy}
//                                 fertilityJourney={fertilityJourney}
//                                 setFertilityJourney={setFertilityJourney}
//                                 discharge={discharge}
//                                 setDischarge={setDischarge}
//                                 vulvaCondition={vulvaCondition}
//                                 setVulvaCondition={setVulvaCondition}
//                                 smell={smell}
//                                 setSmell={setSmell}
//                                 urination={urination}
//                                 setUrination={setUrination}
//                                 notes={notes}
//                                 setNotes={setNotes}
//                             />
//                         </div>
//                     </div>
//                 </Container>
//                 <BottomBlock>
//                     {/* On submit: navigate to detailed results page and pass all user inputs */}
//                     <Button
//                         onClick={() => navigate("/result-with-details", {
//                             state: {
//                                 phValue,
//                                 phLevel,
//                                 timestamp,
//                                 interpretation,
//                                 recommendations,
//                                 age,
//                                 ethnicBackground,
//                                 menstrualCycle,
//                                 hormoneDiagnoses,
//                                 birthControl,
//                                 hormoneTherapy,
//                                 fertilityJourney,
//                                 discharge,
//                                 vulvaCondition,
//                                 smell,
//                                 urination,
//                                 notes
//                             }
//                         })}
//                     >
//                         Save details
//                     </Button>
//                     <ButtonReverse onClick={() => navigate("/result-without-details")}>Go back</ButtonReverse>
//                 </BottomBlock>
//             </div>
//         </>
//     )
// };

// export default AddDetailsPage;




import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import { analyzePh } from "../../shared/api/images-api";
import { getInterpretation } from "../../shared/utils/getInterpretation";

import styles from "./AddDetailsPage.module.css";

const getPhLevel = (ph) => {
    if (ph < 4.5) return "Normal";
    if (ph >= 4.5 && ph <= 4.9) return "Slightly Elevated";
    return "Elevated";
};

const firstOrNull = (value) => {
    if (Array.isArray(value)) return value[0] ?? null;
    if (value === undefined || value === "") return null;
    return value ?? null;
};

const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === undefined || value === null || value === "") return [];
    return [value].filter(Boolean);
};

const AddDetailsPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const phValue = state?.phValue;
    const timestamp = state?.timestamp;
    const recommendations = state?.recommendations;

    // Pre-fill user details if they were passed from the previous screen
    // Otherwise initialize with empty/default values
    const [age, setAge] = useState(state?.age || "");
    const [lifeStage, setLifeStage] = useState(state?.lifeStage || []);
    const [ethnicBackground, setEthnicBackground] = useState(state?.ethnicBackground || []);
    const [menstrualCycle, setMenstrualCycle] = useState(state?.menstrualCycle || []);
    const [hormoneDiagnoses, setHormoneDiagnoses] = useState(state?.hormoneDiagnoses || []);
    const [birthControl, setBirthControl] = useState(
        state?.birthControl || {
            general: null,
            pill: null,
            iud: null,
            otherHormonalMethods: null,
            permanentMethods: null,
        }
    );
    const [hormoneTherapy, setHormoneTherapy] = useState(
        state?.hormoneTherapy || {
            general: null,
            hormoneReplacement: []
        }
    );
    const [fertilityJourney, setFertilityJourney] = useState(
        state?.fertilityJourney || {
            currentStatus: null,
            fertilityTreatments: []
        }
    );
    const [discharge, setDischarge] = useState(state?.discharge || []);
    const [vulvaCondition, setVulvaCondition] = useState(state?.vulvaCondition || []);
    const [smell, setSmell] = useState(state?.smell || []);
    const [urination, setUrination] = useState(state?.urination || []);
    const [notes, setNotes] = useState(state?.notes || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveDetails = async () => {
        if (phValue === undefined || phValue === null) {
            alert("Missing pH result. Please go back and complete the test.");
            return;
        }
        const ageTrimmed = String(age ?? "").trim();
        let ageForApi = undefined;
        if (ageTrimmed !== "") {
            const ageNum = parseInt(ageTrimmed, 10);
            if (Number.isNaN(ageNum) || ageNum < 1) {
                alert("Please enter a valid age, or leave the field empty.");
                return;
            }
            ageForApi = ageNum;
        }

        const payload = {
            ph_value: Number(phValue),
            age: ageForApi ?? null,
            life_stage: toArray(lifeStage),
            diagnoses: toArray(hormoneDiagnoses),
            ethnic_backgrounds: toArray(ethnicBackground),
            menstrual_cycle: firstOrNull(menstrualCycle),
            birth_control: {
                general: birthControl?.general ?? null,
                pill: birthControl?.pill ?? null,
                iud: birthControl?.iud ?? null,
                other_methods: toArray(birthControl?.otherHormonalMethods),
                permanent: toArray(birthControl?.permanentMethods),
            },
            hormone_therapy: toArray(hormoneTherapy?.general),
            hrt: toArray(hormoneTherapy?.hormoneReplacement),
            fertility_journey: {
                current_status: fertilityJourney?.currentStatus ?? null,
                fertility_treatments: toArray(fertilityJourney?.fertilityTreatments),
            },
            symptoms: {
                discharge: toArray(discharge),
                vulva_vagina: toArray(vulvaCondition),
                smell: toArray(smell),
                urine: toArray(urination),
                notes: String(notes ?? ""),
            },
        };
        console.log("Request:", payload);

        setIsSaving(true);
        try {
            const backendResponse = await analyzePh(payload);
            console.log("Analyze API raw response:", backendResponse);
            const nextPhValue = Number(
                backendResponse?.phValue ?? backendResponse?.ph_value ?? phValue
            );
            const nextPhLevel = getPhLevel(nextPhValue);
            const nextInterpretation = getInterpretation(
                nextPhLevel,
                nextPhValue.toFixed(2)
            );

            navigate("/result-with-details", {
                state: {
                    phValue: nextPhValue,
                    phLevel: nextPhLevel,
                    timestamp,
                    interpretation: nextInterpretation,
                    recommendations:
                        backendResponse?.agent_reply ?? recommendations,
                    citations: backendResponse?.citations ?? [],
                    age,
                    lifeStage,
                    ethnicBackground,
                    menstrualCycle,
                    hormoneDiagnoses,
                    birthControl,
                    hormoneTherapy,
                    fertilityJourney,
                    discharge,
                    vulvaCondition,
                    smell,
                    urination,
                    notes,
                },
            });
        } catch (err) {
            alert(`Failed: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className={styles.content} data-scroll-container>
                <Container>
                    <div className={styles.containerInner}>
                        <div className={styles.heading}>
                            <h1 className={styles.title}>To help us give you more accurate and meaningful insights, please select what best describes you.</h1>
                            <p className={styles.privacyPolicy}>
                                We process your responses in real time only to provide context for your result. They are not stored. You can read more in our <a href="#">Privacy Policy</a>.
                            </p>
                        </div>
                        <div className={styles.personalData}>
                            {/* Main form component where user selects personal details */}
                            <PersonalData
                                age={age}
                                setAge={setAge}
                                lifeStage={lifeStage}
                                setLifeStage={setLifeStage}
                                ethnicBackground={ethnicBackground}
                                setEthnicBackground={setEthnicBackground}
                                menstrualCycle={menstrualCycle}
                                setMenstrualCycle={setMenstrualCycle}
                                hormoneDiagnoses={hormoneDiagnoses}
                                setHormoneDiagnoses={setHormoneDiagnoses}
                                birthControl={birthControl}
                                setBirthControl={setBirthControl}
                                hormoneTherapy={hormoneTherapy}
                                setHormoneTherapy={setHormoneTherapy}
                                fertilityJourney={fertilityJourney}
                                setFertilityJourney={setFertilityJourney}
                                discharge={discharge}
                                setDischarge={setDischarge}
                                vulvaCondition={vulvaCondition}
                                setVulvaCondition={setVulvaCondition}
                                smell={smell}
                                setSmell={setSmell}
                                urination={urination}
                                setUrination={setUrination}
                                notes={notes}
                                setNotes={setNotes}
                            />
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    {/* On submit: navigate to detailed results page and pass all user inputs */}
                    <Button
                        onClick={handleSaveDetails}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving…" : "Save details"}
                    </Button>
                    <ButtonReverse onClick={() => navigate(-1)}>Go back</ButtonReverse>
                </BottomBlock>
            </div>
        </>
    )
};

export default AddDetailsPage;