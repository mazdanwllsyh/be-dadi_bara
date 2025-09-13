import React, { useEffect, useState, useContext } from "react";
import { Helmet } from "react-helmet-async";
import AOS from "aos";
import "aos/dist/aos.css";
import { AppContext } from "../AppContext";
import { toast } from "react-toastify";
import SKSkeleton from "./skeletons/SKSkeleton.jsx";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Spinner } from "react-bootstrap";
import instance from "../../../utils/axios.js";

const SK = () => {
  const { data, theme } = useContext(AppContext);
  const [skDocument, setSkDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchSk = async () => {
      try {
        const response = await instance.get("/sk");
        setSkDocument(response.data);
      } catch (error) {
        toast.error("Gagal memuat dokumen SK.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSk();

    AOS.init({
      duration: 1550,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  if (isLoading) {
    return <SKSkeleton />;
  }

  return (
    <section id="sk-dadibara">
      <Helmet>
        <title>Surat Keputusan | Dadi Bara</title>
        <link rel="canonical" href="https://dadibara.bejalen.com/sk" />
        <meta
          name="description"
          content="Lihat dokumen Surat Keputusan (SK) resmi mengenai penetapan struktur organisasi Karang Taruna DADI BARA Desa Bejalen."
        />
        <meta
          name="keywords"
          content="Karang Taruna, SK DADI BARA, Bejalen, Ambarawa, organisasi sosial, Karang Taruna DADI BARA, Surat Keputusan"
        />
        <meta
          property="og:title"
          content="Surat Keputusan (SK) | Karang Taruna Dadi Bara"
        />
        <meta
          property="og:description"
          content="Dokumen legalitas resmi terkait struktur kepengurusan Karang Taruna DADI BARA Bejalen."
        />
        <meta property="og:url" content="https://dadibara.bejalen.com/sk" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754980910/sk-dokumen-SK20BARA20Salinan28aseli29-1754621726169_page-0001_g5vytd.jpg"
        />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Karang Taruna DADI BARA" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Surat Keputusan (SK) | Karang Taruna Dadi Bara"
        />
        <meta
          name="twitter:description"
          content="Dokumen legalitas resmi terkait struktur kepengurusan Karang Taruna DADI BARA Bejalen."
        />
        <meta
          name="twitter:image"
          content="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754980910/sk-dokumen-SK20BARA20Salinan28aseli29-1754621726169_page-0001_g5vytd.jpg"
        />
      </Helmet>
      <div className="container my-5" data-aos="fade-up">
        <h2 className="section-title text-center mb-3">
          SK - Pengurus {data.namaOrganisasi}
        </h2>
        <p className="section-subtitle text-center mb-3 opacity-75">
          "Surat Keputusan Karang Taruna {data.namaOrganisasi}"
        </p>
        {skDocument ? (
          <div
            className={`shadow pdf-viewer-container ${
              theme === "dark" ? "rpv-core__viewer--dark" : ""
            }`}
            style={{
              border: "1px solid #ddd",
              height: "1000px",
              width: "100%",
            }}
          >
            <Worker workerUrl="/workers/pdf.worker.min.js">
              <Viewer
                fileUrl={skDocument.filePath}
                plugins={[defaultLayoutPluginInstance]}
                theme={theme}
              />
            </Worker>
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <p className="text-muted">Dokumen SK belum diunggah.</p>
          </div>
        )}
      </div>
    </section>
  );
};
export default SK;
