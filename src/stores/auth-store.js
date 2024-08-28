import { defineStore } from "pinia";

export const useUserStore = defineStore(
	"user",
	() => {
		const user = ref({});
		const isLoggedIn = ref(false);

		const manager = ref(null);
		const managerLoggedIn = ref(false);
		const timer = ref(0);

		function setUser(newUser) {
			user.value = newUser;
			isLoggedIn.value = true;
		}

		const updateTimer = () => {
			timer.value = timer.value + 1;
		};
		function setManager(newManager) {
			manager.value = newManager;
			managerLoggedIn.value = true;
		}

		const resetTimer = () => {
			timer.value = 0;
		};

		function clearManager() {
			manager.value = null;
			managerLoggedIn.value = false;
		}

		function clearUser() {
			manager.value = null;
			user.value = {};
			isLoggedIn.value = false;
		}

		return {
			user,
			manager,
			isLoggedIn,
			managerLoggedIn,
			timer,
			setUser,
			clearUser,
			setManager,
			clearManager,
			resetTimer,
			updateTimer,
		};
	},
	{
		persist: true,
	}
);
