import { render } from 'solid-js/web'
import { Router, Route, useLocation, useNavigate } from "@solidjs/router";
import { createEffect, lazy, onCleanup, onMount, Show, Suspense } from "solid-js";

import './index.css'

import {Header} from "./layout/Header.tsx";
import {Footer} from "./layout/Footer.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import {setIsMenuWhite} from "./stores/styleStore.ts";
import { backend, getNeonApp, getTravelTypes, pingBackend, startNeonAuth } from './stores/configStore.ts';
import { getUserFromDatabase, getUserMemberTripsFromDatabase, setUserTrips, user, setUserProfile, login } from './stores/userStore.ts';
import { loader, startLoading, stopLoading } from './stores/loaderStore.ts';
import { getAllTrips } from './stores/tripStore.ts';
import { ConversationsPage } from './pages/Conversations/ConversationsPage.tsx';
import { disconnectSocket, initSocket, joinMultipleTripRooms, identifyUser, resetSocket } from './stores/websocketStore.ts';
import { getMessagesByTripId, getUnansweredQuestions } from './stores/messagesStore.ts';
import type { Trip } from './models/trip.model.ts';
import AdminPage from './pages/Admin/AdminPage.tsx';
import { checkUserBanStatus } from './utils/banUtils.ts';
import BannedPage from './pages/SignPage/BannedPage.tsx';


const VoyagePage = lazy(() => import("./pages/Voyage/VoyageList/index.tsx"));
const CreateTripPage = lazy(() => import("./pages/Voyage/CreateTrip/CreateTripPage.tsx"));
const VoyageDetailPage = lazy(() => import("./pages/Voyage/VoyageDetail/index.tsx"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage.tsx"));
const SignUpPage = lazy(() => import('./pages/SignPage/SignUpPage.tsx'));
const SignInPage = lazy(() => import('./pages/SignPage/SignInPage.tsx'));
const ContinueSignUp = lazy(() => import('./pages/SignPage/ContinueSignUp.tsx'));
const ProfilePictureStep = lazy(() => import('./pages/SignPage/ProfilePictureStep.tsx'));
const UserProfilePage = lazy(() => import("./pages/Profile/UserProfile/index.tsx"));
const ForgotPasswordPage = lazy(() => import('./pages/SignPage/ForgotPasswordPage.tsx'));
const ResetPasswordPage = lazy(() => import('./pages/SignPage/ResetPasswordPage.tsx'));


const Layout = (props:any) => {

    const location = useLocation();
    const navigate = useNavigate();

    createEffect(() => {
        const pathname = location.pathname;
        const whiteMenuPaths = ["/"];
        const isWhite = whiteMenuPaths.includes(pathname);
        
        setIsMenuWhite(isWhite);
    });

    onMount(() => {
        const interval = setInterval(() => {
            pingBackend();
        }, 30000);

        onCleanup(() => clearInterval(interval));

        (async () => {
            try {
                startLoading();
                const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));

                await pingBackend();
                await getTravelTypes();
                await getAllTrips();
                await startNeonAuth();
                
                const neonApp = getNeonApp();
                const neonUser = await neonApp?.getUser();
                                
                if (neonUser) {
                    if (user.profile && user.profile.id !== neonUser.id) {
                        resetSocket();
                        setUserProfile(null);
                        setUserTrips([]);
                    }

                    const banStatus = await checkUserBanStatus(neonUser.id);

                    if (banStatus.isBanned) {
                        navigate("/banni", { replace: true });
                        stopLoading();
                        return;
                    }
                    
                    await initSocket();
                    
                    const dbUser = await getUserFromDatabase(neonUser.id);
                    
                    if (dbUser.success && dbUser.data) {
                        
                        setUserProfile({
                            id: dbUser.data.id,
                            username: dbUser.data.username,
                            languages: dbUser.data.languages,
                            budgetLevel: dbUser.data.budgetLevel,
                            travelTypes: dbUser.data.travelTypes || [],
                            city: dbUser.data.city,
                            country: dbUser.data.country,
                            tripsCount: dbUser.data.tripsCount,
                            description: dbUser.data.description,
                            profilePictureUrl: dbUser.data.profilePictureUrl,
                            isVerified: dbUser.data.isVerified,
                            isAdmin: dbUser.data.isAdmin
                        });

                        identifyUser(dbUser.data.id);
                        
                        await new Promise(resolve => setTimeout(resolve, 500));

                        const memberTrips = await getUserMemberTripsFromDatabase(dbUser.data.id);
                        
                        if (memberTrips.success && memberTrips.data) {
                            setUserTrips(memberTrips.data);
                            
                            const tripIds = memberTrips.data.map((t: Trip) => t.id);
                            
                            if (tripIds.length > 0) {
                                await Promise.all(
                                    tripIds.map((tripId:string) => getMessagesByTripId(tripId, dbUser.data.id, 1))
                                );
                                
                                joinMultipleTripRooms(memberTrips.data, dbUser.data.id);
                            }

                            await getUnansweredQuestions(dbUser.data.id);

                        }

                        login();

                        console.log("my user id", user.profile?.id)
                        
                        if (location.pathname === "/inscription" || 
                            location.pathname === "/connexion" || 
                            location.pathname === "/inscription/continuer") {
                            navigate("/", { replace: true });
                        }
                        
                    } else {
                        console.error('Utilisateur non trouvé dans la BDD');
                    }
                } else {
                    console.log('Aucun utilisateur connecté');
                }

                await minLoadTime;
                stopLoading();
            } catch (error) {
                console.error('Erreur lors de l\'initialisation:', error);
                stopLoading();
            }
        })();
    });

    onCleanup(() => {
        disconnectSocket();
    });

    return (
        <>
            <Show when={backend.isConnected}>
                <div class={"flex flex-col bg-color-light min-h-screen"}>
                    <Header />
                    <Suspense fallback={
                        <div class="flex-1 flex items-center justify-center">
                            <span class="loading loading-spinner loading-lg text-color-main"></span>
                        </div>
                    }>
                        {props.children}
                    </Suspense>
                    <Footer />
                </div>
            </Show>
            <Show when={!backend.isConnected}>
                <div class={"flex gap-8 flex-col items-center justify-center bg-color-light w-screen h-screen"}>
                    <img src="/logoMain.avif" alt="" class='w-32 h-32'/>
                    <h1 class='text-black text-2xl font-semibold'>
                        Panjéa est actuellement en maintenance, veuillez-revenir d'ici quelques minutes...
                    </h1>
                </div>
            </Show>
            <Show when={loader.isLoading}>
                <div class="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
                    <span class="loading loading-spinner loading-xl text-color-secondary"></span>
                </div>
            </Show>
        </>
    );
};

render(
    () => (
        <Router root={Layout}>
            <Route path="/" component={HomePage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/inscription" component={SignUpPage}/>
            <Route path="/inscription/continuer" component={ContinueSignUp}/>
            <Route path="/inscription/photo" component={ProfilePictureStep}/>
            <Route path="/connexion" component={SignInPage}/>
            <Route path="/mot-de-passe-oublie" component={ForgotPasswordPage}/>
            <Route path="/reset-password" component={ResetPasswordPage}/>
            <Route path="/profile" component={ProfilePage}/>
            <Route path="/user/:id" component={UserProfilePage}/>
            <Route path="/voyage" component={VoyagePage}/>
            <Route path="/voyage/creer" component={CreateTripPage}/>
            <Route path="/voyage/:id" component={VoyageDetailPage}/>
            <Route path="/conversations" component={ConversationsPage}/>
            <Route path="/banni" component={BannedPage}/>
        </Router>
    ),
    // @ts-ignore
    document.getElementById("app")
);