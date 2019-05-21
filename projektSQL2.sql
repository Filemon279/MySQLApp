-- MySQL dump 10.13  Distrib 5.7.25, for Linux (x86_64)
--
-- Host: localhost    Database: projektSQL
-- ------------------------------------------------------
-- Server version	5.7.25-0ubuntu0.16.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `grupa`
--
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `grupa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grupa` (
  `idg` int(11) NOT NULL AUTO_INCREMENT,
  `przedmiot` text NOT NULL,
  `data` datetime NOT NULL,
  `licznosc` tinyint(4) NOT NULL,
  `s_id` int(11) NOT NULL,
  `p_id` int(11) NOT NULL,
  PRIMARY KEY (`idg`),
  KEY `p_id` (`p_id`),
  KEY `s_id` (`s_id`),
  CONSTRAINT `grupa_ibfk_1` FOREIGN KEY (`p_id`) REFERENCES `pracownik` (`idp`),
  CONSTRAINT `grupa_ibfk_2` FOREIGN KEY (`s_id`) REFERENCES `sala` (`ids`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupa`
--

LOCK TABLES `grupa` WRITE;
/*!40000 ALTER TABLE `grupa` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logi`
--

DROP TABLE IF EXISTS `logi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logi` (
  `idl` int(11) NOT NULL AUTO_INCREMENT,
  `data` datetime NOT NULL,
  `akcja` text NOT NULL,
  `s_id` int(11) NOT NULL,
  `o_id` int(11) NOT NULL,
  PRIMARY KEY (`idl`),
  KEY `o_id` (`o_id`),
  KEY `s_id` (`s_id`),
  CONSTRAINT `logi_ibfk_1` FOREIGN KEY (`o_id`) REFERENCES `osoba` (`ido`),
  CONSTRAINT `logi_ibfk_2` FOREIGN KEY (`s_id`) REFERENCES `sala` (`ids`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logi`
--

LOCK TABLES `logi` WRITE;
/*!40000 ALTER TABLE `logi` DISABLE KEYS */;
INSERT INTO `logi` VALUES (1,'2019-04-24 17:50:06','Open door',4,1),(2,'2019-04-24 17:50:21','Open door',6,2),(3,'2019-04-24 17:50:23','Open door',6,6),(4,'2019-04-24 17:50:25','Open door',6,8),(5,'2019-04-24 17:50:52','Try to open door, no access',4,2),(6,'2019-04-24 17:50:53','Try to open door, no access',4,2),(7,'2019-04-24 17:50:54','Try to open door, no access',4,2),(8,'2019-04-24 17:50:54','Try to open door, no access',4,2),(9,'2019-04-24 17:50:54','Try to open door, no access',4,2),(10,'2019-04-24 17:51:06','Open door',7,1),(11,'2019-04-24 17:51:10','Open door',3,7),(12,'2019-04-24 17:51:27','Open door',7,8),(13,'2019-04-24 17:51:43','Door left opened',7,8),(14,'2019-04-24 17:52:09','Door closed from inside',3,5);
/*!40000 ALTER TABLE `logi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `osoba`
--

DROP TABLE IF EXISTS `osoba`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `osoba` (
  `ido` int(11) NOT NULL AUTO_INCREMENT,
  `imie` text NOT NULL,
  `nazwisko` text NOT NULL,
  `st_dostepu` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`ido`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `osoba`
--

LOCK TABLES `osoba` WRITE;
/*!40000 ALTER TABLE `osoba` DISABLE KEYS */;
INSERT INTO `osoba` VALUES (1,'Maciej','Markiewicz',2),(2,'Krystian','Kwilosz',2),(3,'Matylda','Operik',2),(4,'Zbigniew','Porolski',3),(5,'Teodor','Gil',5),(6,'Dorota','Niepodra',2),(7,'Pawel','Hektor',5),(8,'Ewa','Halumi',5),(9,'Ewa','Dobrowolska',2),(10,'Tomasz','Zlawola',2),(11,'Damian','Niekradaj',2),(12,'Marian','Doczekalski',5);
/*!40000 ALTER TABLE `osoba` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pracownik`
--

DROP TABLE IF EXISTS `pracownik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pracownik` (
  `idp` int(11) NOT NULL AUTO_INCREMENT,
  `stanowisko` text,
  `o_id` int(11) NOT NULL,
  PRIMARY KEY (`idp`),
  KEY `o_id` (`o_id`),
  CONSTRAINT `pracownik_ibfk_1` FOREIGN KEY (`o_id`) REFERENCES `osoba` (`ido`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pracownik`
--

LOCK TABLES `pracownik` WRITE;
/*!40000 ALTER TABLE `pracownik` DISABLE KEYS */;
INSERT INTO `pracownik` VALUES (1,'doktorant fizyki teoretycznej',4),(2,'Doktor chemii stosowanej',5),(3,'Pracownik labolatorium fizyki doswiadczalnej',7),(4,'Profesor informatyki',8),(5,'Profesor elektroniki',12);
/*!40000 ALTER TABLE `pracownik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sala` (
  `ids` int(11) NOT NULL AUTO_INCREMENT,
  `numer` int(11) NOT NULL UNIQUE,
  `st_dostepu` tinyint(4) NOT NULL,
  PRIMARY KEY (`ids`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (1,205,5),(2,204,5),(3,203,5),(4,202,5),(5,201,5),(6,101,5),(7,102,5),(8,103,5),(9,104,5),(10,105,5),(11,301,5),(12,302,5),(13,303,5),(14,304,2),(15,305,3),(16,306,2);
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `uczestnik`
--

DROP TABLE IF EXISTS `uczestnik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uczestnik` (
  `idu` int(11) NOT NULL AUTO_INCREMENT,
  `g_id` int(11) NOT NULL,
  `o_id` int(11) NOT NULL,
  PRIMARY KEY (`idu`),
  CONSTRAINT `uczestnik_ibfk_1` FOREIGN KEY (`g_id`) REFERENCES `grupa` (`idg`),
  CONSTRAINT `uczestnik_ibfk_2` FOREIGN KEY (`o_id`) REFERENCES `osoba` (`ido`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student` (
  `ids` int(11) NOT NULL AUTO_INCREMENT,
  `nr_indeksu` int(11) NOT NULL,
  `o_id` int(11) NOT NULL,
  PRIMARY KEY (`ids`),
  KEY `o_id` (`o_id`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`o_id`) REFERENCES `osoba` (`ido`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,284673,1),(2,286565,2),(3,291263,3),(5,275584,6),(6,276723,9),(7,276712,10),(8,297562,11);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
SET FOREIGN_KEY_CHECKS=1;

-- Dump completed on 2019-04-24 17:58:01
