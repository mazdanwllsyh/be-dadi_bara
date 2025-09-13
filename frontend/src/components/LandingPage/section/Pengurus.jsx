import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Container, FloatingLabel, Form, InputGroup } from "react-bootstrap";
import PengurusSkeleton from "./skeletons/PengurusSkeleton";
import { FaSearch, FaInstagram } from "react-icons/fa";
import { AppContext } from "../AppContext";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import instance from "../../../utils/axios";

const Pengurus = () => {
  const { data } = useContext(AppContext);
  const [dataPengurus, setDataPengurus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const resultsRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 900 });

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await instance.get("/members");
        setDataPengurus(response.data);
      } catch (error) {
        toast.error("Gagal memuat data pengurus.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredPengurus = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      return dataPengurus;
    }

    const searchLower = trimmedSearch.toLowerCase();
    const searchWords = searchLower.split(/\s+/);

    const scoredPengurus = dataPengurus.map((person) => {
      const namaLower = person.nama.toLowerCase();
      const namaWords = namaLower.split(/\s+/);

      const jabatanLower = person.titleLabel.toLowerCase();
      const jabatanWords = jabatanLower.split(/\s+/);

      let score = 0;

      if (namaLower === searchLower || jabatanLower === searchLower) {
        score = 100;
      } else {
        searchWords.forEach((searchWord) => {
          if (namaWords.some((namaWord) => namaWord.startsWith(searchWord))) {
            score += 10;
          }
          if (
            jabatanWords.some((jabatanWord) =>
              jabatanWord.startsWith(searchWord)
            )
          ) {
            score += 5;
          }
        });
      }
      return { ...person, score };
    });

    return scoredPengurus
      .filter((person) => person.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [searchTerm, dataPengurus]);

  const roleOrder = [
    "Ketua 1",
    "Ketua 2",
    "Sekretaris 1",
    "Sekretaris 2",
    "Bendahara 1",
    "Bendahara 2",
    "Seksi Umum",
    "Kerohanian Islam",
    "Kerohanian Kristen",
    "Kerohanian Katholik",
    "Hubungan Masyarakat",
    "Sie Teknologi dan Informatika",
    "Sie Sosial Budaya",
    "Olahraga Kepemudaan",
  ];

  const multiLevelSort = (a, b) => {
    const roleIndexA = roleOrder.indexOf(a.titleLabel);
    const roleIndexB = roleOrder.indexOf(b.titleLabel);

    if (roleIndexA !== roleIndexB) {
      return roleIndexA - roleIndexB;
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  };

  const groupByRole = (pengurus) => {
    const groups = pengurus.reduce((acc, person) => {
      const role = person.titleLabel;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(person);
      return acc;
    }, {});

    for (const role in groups) {
      groups[role].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    return groups;
  };

  const groupedPengurus = groupByRole(filteredPengurus);

  const groupTitles = {
    Ketua: ["Ketua 1", "Ketua 2"],
    Sekretaris: ["Sekretaris 1", "Sekretaris 2"],
    Bendahara: ["Bendahara 1", "Bendahara 2"],
    "Seksi Kerohanian": [
      "Kerohanian Islam",
      "Kerohanian Kristen",
      "Kerohanian Katholik",
    ],
    "Seksi Umum": ["Sie Umum"],
    "Para Seksi Lainnya": [
      "Hubungan Masyarakat",
      "Sie Teknologi dan Informatika",
      "Sie Sosial Budaya",
      "Olahraga Kepemudaan",
    ],
  };

  const {
    ketua,
    sekretaris,
    bendahara,
    seksiKerohanian,
    seksiUmum,
    seksiLainnya,
  } = groupByRole(filteredPengurus);

  const getAnimation = (groupIndex, memberIndex) => {
    const animations = [
      "fade-right",
      "fade-left",
      "fade-up",
      "fade-down",
      "zoom-in",
      "zoom-out",
      "flip-left",
      "flip-right",
    ];
    const index = (groupIndex * 4 + memberIndex) % animations.length;
    return animations[index];
  };

  const generateStructuredData = () => {
    if (!dataPengurus || dataPengurus.length === 0) {
      return null;
    }

    const membersList = dataPengurus.map((person) => ({
      "@type": "Person",
      name: person.nama,
      jobTitle: person.titleLabel,
      image: person.foto,
      url: `https://dadibara.bejalen.com/pengurus#${person.nama.replace(
        /\s+/g,
        "-"
      )}`, // URL unik jika ada
      sameAs: person.instagram
        ? `https://instagram.com/${person.instagram}`
        : undefined,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Karang Taruna DADI BARA",
      url: "https://dadibara.bejalen.com",
      logo: "https://res.cloudinary.com/dr7olcn4r/image/upload/v1754596459/landing-page-logos/landing-page-logos-LogoKartar-1754596456138.png",
      member: membersList,
    };
  };

  const structuredData = generateStructuredData();

  if (isLoading) {
    return <PengurusSkeleton />;
  }

  return (
    <section
      id="pengurus-dadi-bara"
      className="team-grid d-flex align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Helmet>
        <title>Pengurus | Dadi Bara</title>
        <link rel="canonical" href="https://dadibara.bejalen.com/pengurus" />
        <meta
          name="description"
          content="Kenali lebih dekat jajaran pengurus Karang Taruna DADI BARA Bejalen periode saat ini."
        />
        <meta
          name="keywords"
          content="Pengurus Karang Taruna Dadi Bara, KARTAR Bejalen, Ambarawa, organisasi sosial, Karang Taruna, Pemuda Pemudi, Pengurus Dadi Bara"
        />
        <meta
          property="og:title"
          content="Struktur Pengurus | Karang Taruna Dadi Bara"
        />
        <meta
          property="og:description"
          content="Kenali lebih dekat jajaran pengurus Karang Taruna Desa Bejalen."
        />
        <meta
          property="og:url"
          content="https://dadibara.bejalen.com/pengurus"
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754596459/landing-page-logos/landing-page-logos-LogoKartar-1754596456138.png"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Karang Taruna DADI BARA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Struktur Pengurus | Karang Taruna Dadi Bara"
        />
        <meta
          name="twitter:description"
          content="Kenali lebih dekat jajaran pengurus Karang Taruna DADI BARA Bejalen."
        />
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>
      <Container className="py-5">
        <div className="intro">
          <h2 className="section-title text-center" data-aos="zoom-in">
            Pengurus {data.namaOrganisasi}
          </h2>
          <p className="section-subtitle text-center" data-aos="flip-right">
            Ketua beserta Seksi-seksinya
          </p>

          <Container className="py-3 mt-3" data-aos="fade-down">
            <Form.Group className="position-relative" controlId="searchInput">
              {" "}
              {/* Ubah controlId di sini */}
              <InputGroup className="mx-auto w-100 w-md-75">
                <FloatingLabel
                  controlId="searchInput" // Samakan dengan Form.Group
                  label="Cari Nama atau Peran"
                  className="flex-grow-5 text-center"
                  style={{
                    fontSize: "85%",
                  }}
                >
                  <Form.Control
                    type="search"
                    placeholder="Cari berdasarkan Nama atau Peran ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </FloatingLabel>
                {!isFocused && !searchTerm && (
                  <InputGroup.Text>
                    {" "}
                    <FaSearch />
                  </InputGroup.Text>
                )}
              </InputGroup>
            </Form.Group>
            <p className="small text-center mt-3 section-subtitle opacity-25 text-body-emphasis">
              *Ketuk foto untuk mengetahui nama
            </p>
          </Container>
        </div>

        {filteredPengurus.length === 0 && searchTerm && (
          <div className="text-center my-5" data-aos="fade-up">
            <h5 className="text-danger section-title">Tidak Ditemukan</h5>
            <p className="section-subtitle">
              Sementara ini, nama atau peran tersebut tidak ada dalam Data
              Kepengurusan {data.namaOrganisasi}.
            </p>
          </div>
        )}

        <div ref={resultsRef} className="mt-4">
          {Object.entries(groupTitles).map(([title, roles], groupIndex) => {
            const membersInGroup = roles.flatMap(
              (role) => groupedPengurus[role] || []
            );
            membersInGroup.sort(
              (a, b) =>
                roleOrder.indexOf(a.titleLabel) -
                roleOrder.indexOf(b.titleLabel)
            );

            if (membersInGroup.length === 0) return null;

            const isPimpinan =
              title === "Ketua" ||
              title === "Sekretaris" ||
              title === "Bendahara";
            const rowClass = isPimpinan
              ? "row people row-cols-1 row-cols-md-2 justify-content-center"
              : "row people row-cols-1 row-cols-sm-2 row-cols-lg-4 justify-content-center";

            const boxClass = isPimpinan ? "box box-1" : "box box-2";

            return (
              <div key={title} className="mb-1">
                <h5
                  className="text-custom text-center fw-bold col-12"
                  data-aos="flip-up"
                >
                  {title}
                </h5>
                <div className={rowClass}>
                  {membersInGroup.map((person, memberIndex) => (
                    <div
                      key={person._id}
                      className="col item"
                      data-aos={getAnimation(groupIndex, memberIndex)}
                    >
                      <div
                        className={boxClass}
                        style={{ backgroundImage: `url('${person.foto}')` }}
                      >
                        <div className="cover">
                          <h3 className="name">{person.nama}</h3>
                          <p className="title my-3">{person.titleLabel}</p>
                          <div className="social">
                            {person.instagram && (
                              <a
                                href={`https://instagram.com/${person.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FaInstagram />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Pengurus;
