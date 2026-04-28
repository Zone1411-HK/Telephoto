-- Adatbázis létrehozása kezdete

CREATE DATABASE telephoto
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

-- Adatbázis létrehozása vége

-- Táblák létrehozása kezdete
USE telephoto;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 28. 20:01
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `telephoto`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chats`
--

CREATE TABLE `chats` (
  `chat_id` int(11) NOT NULL,
  `chat_name` varchar(50) NOT NULL,
  `chat_picture_link` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `chats`
--

INSERT INTO `chats` (`chat_id`, `chat_name`, `chat_picture_link`) VALUES
(6, 'ASSG', '1777394400595-Kepernyokep_2025-04-28_190014.png');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `chat_members`
--

CREATE TABLE `chat_members` (
  `member_id` int(11) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `chat_members`
--

INSERT INTO `chat_members` (`member_id`, `chat_id`, `user_id`) VALUES
(14, 6, 8),
(16, 6, 7),
(17, 6, 6);

--
-- Eseményindítók `chat_members`
--
DELIMITER $$
CREATE TRIGGER `check_chat_for_delete` AFTER DELETE ON `chat_members` FOR EACH ROW BEGIN
DELETE FROM chats
WHERE (SELECT COUNT(chat_members.user_id) FROM chat_members WHERE chat_members.chat_id = OLD.chat_id) < 2;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `comment_content` varchar(150) NOT NULL,
  `comment_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_reported` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `comments`
--

INSERT INTO `comments` (`comment_id`, `user_id`, `post_id`, `comment_content`, `comment_date`, `is_reported`) VALUES
(29, 3, 5, 'AZÉRT GRÖNLAND SZEBB VOLTT', '2026-04-28 15:16:24', 0),
(30, 3, 6, 'PERSZE AZOKKAL A LUSTA FIAIDAL', '2026-04-28 15:17:05', 1),
(31, 3, 7, 'AZÉN RÓZSÁIM SOKAL SZEBBEK', '2026-04-28 15:17:29', 0),
(32, 5, 8, 'nagyon jó helyesírás xd', '2026-04-28 16:30:27', 0),
(33, 8, 14, 'XD', '2026-04-28 16:50:36', 0),
(34, 9, 11, 'SZAKADOK XDDDDDDD', '2026-04-28 17:46:38', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `favorites`
--

CREATE TABLE `favorites` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_favorited` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `favorites`
--

INSERT INTO `favorites` (`post_id`, `user_id`, `is_favorited`) VALUES
(5, 4, 1),
(9, 4, 1),
(10, 4, 1),
(11, 7, 1),
(10, 6, 1),
(16, 9, 1),
(18, 3, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `interactions`
--

CREATE TABLE `interactions` (
  `interaction_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `upvote` tinyint(1) DEFAULT NULL,
  `downvote` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `interactions`
--

INSERT INTO `interactions` (`interaction_id`, `user_id`, `post_id`, `upvote`, `downvote`) VALUES
(3, 2, 5, 1, 0),
(4, 2, 6, 1, 0),
(5, 2, 7, 1, 0),
(6, 3, 5, 0, 1),
(7, 3, 6, 0, 1),
(8, 3, 7, 0, 1),
(9, 3, 8, 1, 0),
(10, 3, 9, 1, 0),
(11, 4, 9, 1, 0),
(12, 4, 5, 1, 0),
(13, 4, 6, 0, 1),
(14, 4, 10, 1, 0),
(15, 5, 11, 1, 0),
(16, 5, 9, 0, 1),
(17, 5, 8, 0, 1),
(18, 7, 10, 1, 0),
(19, 7, 11, 1, 0),
(20, 7, 12, 1, 0),
(21, 7, 13, 1, 0),
(22, 6, 14, 1, 0),
(23, 6, 12, 1, 0),
(24, 6, 13, 1, 0),
(25, 6, 10, 1, 0),
(26, 6, 11, 1, 0),
(27, 3, 11, 0, 1),
(28, 3, 12, 0, 1),
(29, 3, 13, 0, 1),
(30, 3, 14, 1, 0),
(31, 8, 15, 1, 0),
(32, 8, 10, 1, 0),
(33, 8, 11, 0, 1),
(34, 8, 14, 1, 0),
(35, 8, 5, 1, 0),
(36, 8, 9, 0, 1),
(37, 8, 12, 1, 0),
(38, 8, 13, 1, 0),
(39, 8, 7, 1, 0),
(40, 8, 8, 0, 1),
(41, 8, 6, 1, 0),
(42, 9, 10, 1, 0),
(43, 9, 14, 1, 0),
(44, 9, 12, 1, 0),
(45, 9, 13, 1, 0),
(46, 9, 11, 1, 0),
(47, 9, 15, 1, 0),
(48, 9, 16, 1, 0),
(49, 10, 16, 1, 0),
(50, 10, 17, 1, 0),
(51, 3, 18, 1, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `messages`
--

CREATE TABLE `messages` (
  `member_id` int(11) DEFAULT NULL,
  `message` varchar(200) NOT NULL,
  `message_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `messages`
--

INSERT INTO `messages` (`member_id`, `message`, `message_date`) VALUES
(16, 'Acko ma foca?', '2026-04-28 18:40:07'),
(17, 'Bocsi de mégse tudok ma menni', '2026-04-28 18:41:50'),
(14, 'persze...', '2026-04-28 18:50:01');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `pictures`
--

CREATE TABLE `pictures` (
  `picture_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `picture_link` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `pictures`
--

INSERT INTO `pictures` (`picture_id`, `post_id`, `picture_link`) VALUES
(5, 5, '1777388711934-tim-stief-YFFGkE3y4F8-unsplash.jpg'),
(6, 6, '1777388925300-4png.webp'),
(7, 6, '1777388925301-firewood-8313630_1280.jpg'),
(8, 7, '1777389058463-petunia-kek-es-ciklamen-shutterstock_583170556.jpg'),
(9, 8, '1777389563322-394-teahibrid.jpg'),
(10, 8, '1777389563323-viragfold-xffff606337-0x0.webp'),
(11, 8, '1777389563323-0_kapa01.jpg'),
(12, 9, '1777389782151-john-lee-oMneOBYhJxY-unsplash.jpg'),
(13, 10, '1777393423386-benjamin-voros-phIFdC6lA4E-unsplash.jpg'),
(14, 11, '1777393764190-mcisti.mp4'),
(15, 12, '1777394078554-come-on-you-gunners-v0-uzeoc6yaa8tg1.webp'),
(16, 13, '1777394111297-its-not-over-till-its-over-v0-mhjtfw5kjokg1.webp'),
(17, 14, '1777394631058-EgrQpSjWkAYEnPO.jpg'),
(18, 15, '1777394989190-mesi.webp'),
(19, 16, '1777398309807-mac.jpg'),
(20, 17, '1777398661295-pez-refill-orange.jpg'),
(21, 18, '1777399041198-Header_VIE_Habsburger-1080x675.webp'),
(22, 19, '1777399179094-a73d50bf8f85909b7b5aa61f3622e486.jpeg');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `posts`
--

CREATE TABLE `posts` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `location` varchar(176) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `creation_date` datetime DEFAULT NULL,
  `is_reported` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `posts`
--

INSERT INTO `posts` (`post_id`, `user_id`, `description`, `tags`, `location`, `latitude`, `longitude`, `creation_date`, `is_reported`) VALUES
(5, 2, 'Koszonom kedves csaladomnak ezt a fantasztikus utat remelem meg sok ilyen utazasban lehet reszem', '#reykjavik #csalad #koszonom ', 'Reykjavik', 64.173, -21.7433, '2023-02-09 17:05:11', 0),
(6, 2, 'Dolgozunk fiaimmal', '#munka #csalad ', 'Székesfehérvár', 47.1873, 18.4311, '2026-04-28 17:08:45', 0),
(7, 2, 'Gyonyoru szepen viragoznak a petuniaim', '#virag #petunia #csalad #szep ', 'Székesfehérvár', 47.1873, 18.4311, '2026-04-28 17:10:58', 0),
(8, 3, 'AZ ÉN DRÁGA GYŐNYŐRŰ RÓZSÁIM. HÉTVÉGÉN KIŰLTETEM ŐKET', '#RÓZSA #KAPA #LEGSZEBB ', 'Székesfehérvár', 47.1859, 18.4284, '2025-07-10 12:19:23', 0),
(9, 3, 'CSALÁDI KIRUCCANÁS ?', '#SZÉP HELY #NYARALÁS ', 'GRÜNLAND', 66.4009, -46.6933, '2025-10-03 14:23:02', 0),
(10, 4, 'Ez a kép az Alpokban készült egy Canon EOS R8-al', '#Canon #Erdő #Alps #Alpok #Forest #Hegy #Hegység #Mountain #Photography #Fotózás ', 'Alpok', 46.3678, 8.72714, '2024-01-17 18:23:43', 0),
(11, 5, 'XD EZ HÜLYE', '#mcisti #lol #xd ', '', NULL, NULL, '2025-04-30 18:29:24', 0),
(12, 7, 'EGY ÉGŐ LYUKAS KEREKŰ TRAKTOR IS HASZNOSABB MINT MADUEKE', '#Arsenal #Bottle #MaduekeHate ', 'London', NULL, NULL, '2026-04-19 18:34:38', 0),
(13, 7, 'VÉGRE FELÉPÜLT SAKA', '#HOPIUM #SAKA #STARBOY #ARSENAL ', 'LONDON', NULL, NULL, '2026-04-21 11:35:11', 0),
(14, 6, 'Nem baj a következő futam jobban sikerül', '#ForzaFerrari #Leclerc ## #Vettel ', 'Spa-Francorchamps', NULL, NULL, '2020-08-30 18:43:51', 0),
(15, 8, 'My GOAT', '', 'Rosario', NULL, NULL, '2026-04-28 18:49:49', 0),
(16, 9, 'NA JÓÓÓÓ EZ NAGYON DURVÁN JÓ', '#apple #macbook #macbook neo ', '', NULL, NULL, '2026-04-28 19:45:09', 0),
(17, 10, 'Mindjárt megérkezik egy hatalmas pez szállítmány', '#pez #eskü jön ', 'Trefort', NULL, NULL, '2026-04-28 19:51:01', 0),
(18, 3, 'NA IDE IS ELJUTOTTAM NAGYON SZÉP EZ BÉCS', '', 'BÉCS', 48.1883, 16.3543, '2026-04-28 19:57:21', 0),
(19, 2, 'elmentunk a hetvegen berlinbe az unokakkal', '#berlin #csalad #unokak #nemet #nemetorszag ', 'berlin', 52.5163, 13.3781, '2026-04-28 19:59:39', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_salt` varchar(32) NOT NULL,
  `password_hash` varchar(128) NOT NULL,
  `email` varchar(100) NOT NULL,
  `profile_picture_link` text DEFAULT NULL,
  `biography` text DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_reported` tinyint(1) DEFAULT 0,
  `registration_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_salt`, `password_hash`, `email`, `profile_picture_link`, `biography`, `is_admin`, `is_reported`, `registration_date`) VALUES
(1, 'admin', '383d7479d5366c724bd4c9f14b68c6e5', '03c506616efe3c9a83c8825f7ba9ab310ac2e1ae47cf6bd4b81bba6dcfa5b384b062129e620dd80c462a1141ce4ad225491c8b4415ee744d67a08a79e4f477ef', 'admin@admin.com', NULL, NULL, 1, 0, '2026-04-28 16:55:07'),
(2, 'Kiss József', 'b7d78f25d7a1ca003ece84f5375f6144', 'f8dc609c410b1d0046dd1cc495e79a51c7b584e70ffc15944cb04080b3386fa552265c74242035798d6c20c9cc282332c1d58e40fbabc157e9537a483bfc55e6', 'kissjozsef@gmail.com', '1777389258080-kissjozsef.png', 'szeretem a csaladom a viragokat es a csaladom', 0, 0, '2026-04-28 16:57:56'),
(3, 'Horváth Lajos', '6bebf8fdb5d3957d56c3e92a136ed8fe', '7cdae3d8e22a758321d00ea8fb4fa35e469a48e415ca1837c421c48cd63aca99ace6aca2da9a8a9f98435cc310e9fe1757951e8fb569407f3301a32049d64304', 'hlajos@freemail.com', '1777389677942-horvathlajos.png', 'CSAKA LEGSZEBB VIRÁGOK VANNAK AZ OLDALAMON', 0, 0, '2026-04-28 16:58:28'),
(4, 'pthGraphy', '32fd350b1d1699d1d88190e0ab3adce7', '0310addfe372ac85e2faf76268b922425f7328700bb1904afee260de9bf594adfaee4fb76696cdcef924bd193ed87f4e7a02a2aa09178ceec3b164d7353fbe69', 'pth123@gmail.com', '1777393505379-pthGraphy.png', 'Kiskorom óta szenvedélyem a fotózás. Remélem tetszenek a képeim. Kamerám: Canon EOS R8', 0, 0, '2026-04-28 16:58:59'),
(5, 'suloslaszlo', '3b0110886090e68dfdfb09d157165c45', '36b4381d8b30718b6da0ab58c386acb25b2a73a9fc1b5fa6f136e607dfa2d61b39c20f04280721ef4fd97c9b43addca38eeabe1e3f99e319a1a9193cbfa901d6', 'lacika@gmail.com', '1777393862882-portal.jpg', '', 0, 0, '2026-04-28 16:59:28'),
(6, 'beni', '4e3f764a8e80dcbfc0ef5a490d8c3662', '678e3dc2f077d9ec47bef5b079613e45baccecbef1c0daf20c109f672ae9a1c46c48b77ea4b7da5b3433bce11ce75e59cd1129da6cc417c5d61e43f8626e51df', 'bugattibeni@gmail.com', '1777394874926-Untitled.png', '', 0, 0, '2026-04-28 17:00:18'),
(7, 'mxn', '2454cd196b3fdd137ec06bfeab6d7a6d', '9e5d1af7fd81238bc8b46216a78ebaaeadda5920cdb45eca6ac5ed87cb9a47faabfdc2f3f05dec44dcddd98999e67d0408e336af8986a490e6390925046952dc', 'noera2005@gmail.com', '1777394153382-602.png', '#1 ARSENAL FAN ÉS #1 MADUEKE HATER', 0, 0, '2026-04-28 17:00:43'),
(8, 'reppthor13', '9cd9a35cfa02e4ea2c5ae613478c1b71', '5b204dbd2a6b81138c03f6554204fb54e565689d7945e0ffbce23bec8b4e7ef4b77d5579d726f844710cdbe40e52f7d86d1d91035b8bb2b120da4c5fd49b9fca', 'tomiking0327@gmail.com', '1777398524661-nota.png', 'Nem tudom 6-7.', 0, 0, '2026-04-28 17:01:26'),
(9, 'appleFanBoi', '38ea735d649e83029a559305afa224d7', '466abb86cefa686554cddcc6429967c38db23f5556e15c2a8edb5923f35448294e97c0098d9dbd5e77e818dca88a9eb3410a27d8129b6adc3ae3cbbccd675cb8', 'bavrGabor@gmail.com', '1777398361999-Apple_logo_grey-svg.png', 'Legnagyobb apple fan. Okosba vannak dolgaim', 0, 0, '2026-04-28 17:01:55'),
(10, 'pezKapitány01', '47bbe1f01c3abbf0091f884a484437da', '778588d2123db6625b0f84568a6a76274adffeefb1b30715c7481ee333b6ac2d6cd183b21f40e796b552ba37b46dd1cd4ff13c9b148d2b0f48fb39374dd9a8b6', 'holapez@gmail.com', '1777398696485-istockphoto-621352814-612x612.jpg', 'A legnagyobb pez kereskedő', 0, 0, '2026-04-28 17:02:18');

--
-- Eseményindítók `users`
--
DELIMITER $$
CREATE TRIGGER `delete_user_member` BEFORE DELETE ON `users` FOR EACH ROW DELETE FROM chat_members 
WHERE chat_members.user_id = OLD.user_id
$$
DELIMITER ;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chat_id`);

--
-- A tábla indexei `chat_members`
--
ALTER TABLE `chat_members`
  ADD PRIMARY KEY (`member_id`),
  ADD KEY `chat_id` (`chat_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `favorites`
--
ALTER TABLE `favorites`
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `interactions`
--
ALTER TABLE `interactions`
  ADD PRIMARY KEY (`interaction_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `messages`
--
ALTER TABLE `messages`
  ADD KEY `member_id` (`member_id`);

--
-- A tábla indexei `pictures`
--
ALTER TABLE `pictures`
  ADD PRIMARY KEY (`picture_id`),
  ADD KEY `post_id` (`post_id`);

--
-- A tábla indexei `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `chats`
--
ALTER TABLE `chats`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `chat_members`
--
ALTER TABLE `chat_members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT a táblához `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT a táblához `interactions`
--
ALTER TABLE `interactions`
  MODIFY `interaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT a táblához `pictures`
--
ALTER TABLE `pictures`
  MODIFY `picture_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT a táblához `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `chat_members`
--
ALTER TABLE `chat_members`
  ADD CONSTRAINT `chat_members_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`chat_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `interactions`
--
ALTER TABLE `interactions`
  ADD CONSTRAINT `interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interactions_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `chat_members` (`member_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `pictures`
--
ALTER TABLE `pictures`
  ADD CONSTRAINT `pictures_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
