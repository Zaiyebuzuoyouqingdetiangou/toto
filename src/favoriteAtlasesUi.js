import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.99.13";
import { buildFavoriteAtlas, deleteFavoriteAtlas, favoriteAtlasProgress, parseAtlasSlots, listFavoriteAtlases, saveFavoriteAtlas, setAtlasSelection, } from './favoriteAtlases.js?rmv=1.99.13';
import { createFavoriteAtlasDraftGenerator } from './favoriteAtlasGeneration.js?rmv=1.99.13';
const STYLE = __rmT("4TD.chBNbEQxaY7KOt.a8fLlcqH_2i4a5yawuqV7FyE_3oessZIu0OAPe9IXKVvk8ZwOvGrKT_SGpY4bcQxAMM2SB5NjpgIbBrwXj80hIfQmP1ZmFvYIOZPdlUbSnVR7OcpnaMG_FzUDGJyLPNwwjAUt4iJ0lWKTz7Fwh1CGd0vx_IE64qhk7pUOucnJajRJLRVk1SND6m76XfhogA2GtiXs8hHbhSF0Qh2RR6m1zpSjfSQSNDJKU5h_q1TtOBsvX0L4ulZABt_hO.GEwjQ3yL91RWh9tmF8oitfNM6JXT2rJcgoY4zOGcoOhbXnvwdr0WKUeXlIpjcJdnmHItgIKAUSrLhPIA7.fw9Os7JuuM1b0r6g2P_dnwTA1l83kPZVbF9qtI4CWHAYHYr.4u4uFc9jG9w1_W4accCB9UdgO7Trsh8zL9VA9PromHxD38NPo5WWgOX_S6hctJEG81nRsqSm_7C3z7ZH3hVgi8tRYjiBc4cz34u4mk4g5biJeqIhXkK3H0MOxezPrbxE_fLsc_2Bvtu_6AcoAf1zn1XpWUVigLY8RUqGYdE.LL0bYe5MuKmnmiT4PssplTqic2aADAmul3.JOSVxcq3AZDvVJjRsJR2xUOqFQgpDN8CJYyLcASmrbwRcnkR7LIoEVsAd8rap.sOgywRr..UGmspGpseowk1SvZ1bcC6NuITiVktb1HWJgaHv8Mo6Me6DXDJRlbiLT3hqywP1mZwFvbYHSTrweHvoItt0g6XriuZiOPlfH3yRcimomY6GwzKp2OE0Xv8FfO.UZgWENXVsvO9K_2ekkNhBZ0zHmSwBEnOXlSjsnVJA9DEIA7nsNv7wlJOf1YxwviczviOSfKve4SlXwQ8B8Fkg_EORYchdzJfMGiVEtudiaX3do9EcYRE8pci6C3sWtHWTsaMxln58HVBQ6fCz8Psvh7pKbxX53NRbo7oz15lW2y5wbXSk7wrNOavuasae.qeRwrQqxCMa4Tpd1nRIL1AVduQb7_4rVl_Q1rNDmHXG.BygN2IjfHurP4TJ8I7i0BGFSt6lij.L3eBgwzZ6G4czD_lORpn_i5ZnQr.Dv_AYTjEa5O1QmsFTPJ1R165uxYQO_8sgc4v.RcH9j.rIJiI0wI4Q7eusibafFyx7DXH9MmXKx8VsgAmnOzQncQNheY22c4ekUGo.J7T0HvWG7W.BR6um8t9E.RxeVo7kV8K3Md1613V9EcMFUbIVx4x8SFoC09NrlC0ptvUxT9MxnJ7paK0AMAEWLEE96UCobpjhLZNP6Lf_I.JXIM4qavTiFVtfsG.Q.4BJ5jac2LobdMWwx2QXsGoitGxMF7Rli6ldX2Ud_B35MWWd92ECuVKPzzi.vbbdC4BmCvSaDDjJTuo.RMY0QvlZpEVGLJPo9RC5mh8Am1Zox28BhDj3pRUiB4UsmLS_cWDD1w1huZAyWLNLbOfOwfcJvADhSb4r_XNJqy6hhsZh0xZyOAM8.SB3ZNEttqvozHhh4HyD2oC0H92Q8tHcCpRz7nzWxI3pGD5yPVePST.K0ZM8BXPWW4Yx3XBZu.88HaZHS7tgHh3YgNVR7Ypb9QvH.5.UH.xGelcXy6GxtOaC89tS_Qu6H8g8OGpAm0vLdM0MZcfPT6cHuPTKbxUOVA_NgoMA.zdXh9wr8FaQd0a7W15B._Ofe2EQ33bfFBj1EKYBCjJqAQkVmFSJxfyek8WvP_mxNEe410qI0qQqXXuAGH0N9tTOxOodJpEYg7p3_H5iwZxZ7nsv_5z.JSm.9aC1RduT27r1lUHzUu6diU_NNBOJar9eOfl.n8kZy9WhfKeKs9FVm07Bw4wsPDrtg21i67AJz6T4a4dSczo6iv_fiW3_kU83j2nh2R20.nAmn.LGoWrD04NWy9iHr9n9C1YXYiUOHKjFigyMj1BVYZitqQrV6mJ_qV01TV7xFUz7_ndEXZqfcr6ywrCQiB5bZZ_lV_VyQEKpeZvZDe4zHC4Yl5N30eWYFOkGQ6HHzD0z7DSCQD8OgXgdoolHUaXp7S1pDXzrhyDeYmh_49.3L3KnQ.PEHy73f2z9ptdDOK6m3FLPvPgAKMdnXXPAncrDE_A3lp9pLtwyBMveYLUCQlCiW7hT_KF4UxIF1cY9bxqFIGP8nyJn4BmeuZkm2nqC.WtAFCAmwF84fGMUNciFKsSr5jmj1oHH3_MABwM0I7D3071Cs1uq_4eMBouHES7vaNAgL2IWYZvT8hCnTUsRJhUelQJtGfNOpbccgjh1CvS6KqX0fgaDrKH8yScHWbo7ufZL4i02nMg3IM9hQvRKs2o.M4YtO1ZOqb_SlSyLpnKYjJNBQunVeCR4IQ4FbHO0oS9tmN56._z4V4MCtBs8f6dfK5o8m8e9SrPIhwO4CBtMwG3x2ilx6gzXAcMlrP3jPVp35zphegM6yKinEDGahCDdqQ8rib_7KtgPZxfwJxHqguBIo1JGK9yjOoOpP4M7cMG3Ebm2pHhlc2QN4gWIUgKHv8_4m5dEisWXnWkdZ1RagxCJoCOikss39vTMPxD8jcXCtNA9_Cbm4O7WKadgSLprGA9am5glUbSdtGq8zv5ESU_u4L9Zz4moQ8_Q9Mx8Sg4AsnD0_e0P_ud6L0PeG1c0X41Gvf._OGVwB_QklvUurE9Tl1iowAXNno73d93LuIAPOYgGctg8RwlgalpepHciLPh58pCjlH4ARPy2a096icAsoiGXP6nKE7Ggwu8N4pf9C8rAyyuKXXKXIEsN0gtSgwF_5vbm_3k5BxZTzhIUpajZghSA6kMGYoccy5dgdbcpPBh_Jw8ylldy.Ob5m6HDiABTeG2WfJbK.CZ3pNk.FcCMsDGMrkpV9GTSzdHm9_xfs3DMigLWwb9ICC4ye3URskr2HODHrGt7GujOUqkJmI5y2AEr7.sr1VXoQo4niNy0e5yg22WWfKybBDswKeKxHJfaEhYnKgVxsUhZtgOUfjw2CXmW.WkNZL66LuqOBwgnxBZVjyXVYvW.0ug3Dhs0juQR2EhTfGwDYALB2ZDmNSctPokGwmcosKy70hNI7aQ8qPLSRgEG8NeHaXbomIxpkXFSW5AdcW1iW4f2cdhrav.XAZP4mTJq1fGwLIr5wFLR6k2u52f7Isd0wSnNAqihtWWusNeuP65UlfTkFgYOUvbz64qNVICtgUJoDPeYTRAUNlpJl5h85CBk_.4Oh3VwqtrNgdi_sqfirpkQSeufKHaxpZ1Ilab2HCHIzxVpsbdR5YAZ5N21clg3IOXAWfEmqX3CB34HqHkGuTfDZ5qL5h38INHw6Y4ePdxU3Gf1iviMkgIEeXHGz3OitIoRxsfnJYzUtcH2Hm6PZ5srI8Jraie2hSjNE0Nf6Ru.pZs8JHRAthPKv5WUFs1tXlj4aR18KzMRVZxAOwjVD.2EpcUtcQn7o8N6St_nMut1EKGciOICPs5As6GVD5kSzluz6DUa3q_LclKLnv0MNa0LSmUScK66DqancBsuFZhHh5kq.7PtMqjmOT2czlFriOwTtTDfDiIYhKIrcTkbi4MMBXNSCfdzBx6eFtXFI4YMvmxD9kruGUZZ8zP2iaPyCCNKzOZPc3xdQ9qBsKGPgN5_Qf4.E_psuk20KJ47ZTdF0o6G84CcV5uNClYr7EWWk9ylIow9e8f_r7K5AIGo5xg5KJ4TJKpCulgWiM1zTeX_bhP4bo80l6m_Z8_1MQe9GFUI7ApAcOxT2hW3O9KqMEBed.IFyVYTuwuknYrAQyprd0udXvSGqAp5i_Fq0H4wEMyd4aJuwg3lm9N1Njw61d_Xintjcrw8LNjdhpoo_VHrcIwZ4dI6P0kqmgxOetGIKAooOidpMwBqJxHLg8u9UKBQ2ky3f_dO4OKBZ4xoCaSZ5o.vzosgpLq.Z6SdxBFWd9kDe6difgJ2XkrUS.grcbnb8.ADL.MuzehDverB.ngkEv.AzDHoDs873QnImvIpno59u.MYj8Jr.WVaXO4nLw1dUG4mnP6IK58pzNH8pXcxIF6aik9S4XwtKxAmxwBe6OR.HJCoNQPTNVBhSjoZKSI9UuygyTRWAGFR4QN_cRapKy.G_wCfA9pNg1hsh7HTEwKTVjYK_IIXLgSbpmQc4u7OmFW_HDXVUVcOpmKyXSuJsdi2I_1M17TB.wECCac_mAMXoGZ50vw89Vei6CnGVYjspDtYEpCOSdfhN.IU3Gbn4wP8kuMi.hHn78MIZLPMXjKJ1AjcPqeKY2PFuSo4gQXUnRCPRHVV.kqqsCv8sLRO.HmVWXoQg8PhvtTbQXUnfpWXI_EHN3HFBc3wgYYY5BjalLYJBBR4tK7U6PfRPvVJ2kH2z6zOVP.MmS99jzVWY5bQ6ikZRST0rCzquYBFFGDnZIIhEREWLK_Qa6j4zD.yqIbuoPTC8o9bOur1szACqJyii2IMv.6tHQyvFnDTb_YrNVo4ujVYfnhJMUTFEFJkMZSglA0avIemjgq41xWYN5TBknf7hU6A2_FTFunj55HZN3Qgiv4TbHxzaMDb1JeKI3l7IznfwIbGNvD1F_CAjvyb.hE25qcYNepkEGqSDhDPfUVhnDmQ7QClx7BoqzQugP7T.1oUtgnp3SdaVhzGLpWzUbUzMdlgEa8.A2xJgzgPKZ88.le4omzy_ppUmoBh.bebrin9_F3mhEBU545sfa4iN1cmTrJ6JMI6A.i5gwz3H2ZwOy7I_c0_oCFt8DKVX4dk63Cs7X9h9oqoNTyOTKmbWhdtXfzRY706xXG6exp5paDcQgsFonaLMsqVRlQSZiPOYdE2DTpBSuY4AGfcxhE5PcxIRV_YsVD9o.AnSoLgnjzFrEDNUk6_k5ihxgpiGAlV9SQ57qdWqhulRnn0nfQyIVAaLoS8KDCxRlL2DItfZ3k8b2NII7EV9u87x4C_xqESJ14Cp202xmNJSOEsnJpT4zhsihSuk5jOztLCABJcIrDjfEnRNFJMkcm.Ey1PqynS4EI.4Y_3buqS5rxLIVaxK8g0haiiTIfbEHPhbnDPN5fMZJsPrZSmy71Iogfm6b.z7v8lYzBDDB7hZuHuiCu8hukLa8qYl5kpKZntIvymz1MGhvGV_399Li_63k7qvh6oxi6UYne72ov.S3FT7rTOTAKWRvjrUc0eOhEH4GpoTOXESSjuOi5atA.xk3PsYrkWY_uRk52ELmj5oiK4uxC1r_d8G9GQu.hQiM9yTWi4Aq5QTjZdPquMlN0YhBZQtn.XlazhzBgdwsRNT_ZD0hmxLHZeQJwFJ7rhzjJmvHRl.1Pc53Evba67_DRfHGH3FcHs6ZqWE0RhlLBvYwMl9D1rnsM3RKKBrRWKpNvGBan5_wITox8en4O5WFECKMiMYykMQwuCrkvAwJa3YXtryA1iBfd.dh9RJqLIrwCK3FeHRp5rP7P5IUBY1Fmyh67dQzHhRSj3BuB7cNQycpnE1g3xixJ6U2K9dduNpMT609wH1U1_9srl4C.ltcgcjtOZ6LVD9o1DMgWKlb7fhgCqyzc0TMb_pS8loz07LXmXs6oSJ7Ih45f9pyBnmP6LPO_II8klOEOHnII9d25kWR5tEwc3V7GmKteSMLEfNbIqxH5Wmtm2iSPnsWMTXH1YqHa.y_rL4Dn9oRnohu_bz_ffxNfROJ_CaYdI3.tBvXwLw0HvQSGdMeTE3oWBxAg0v8MA9iSdvhOSiblOlSWOc6p1LqHuIUZCmEVeNDevA9YvQT4OkH0EyADawx6BE8cUWk.OmAL6Rlg8erzRKG1lHs2pgK1FDqWVWA00jEQwW27PuJjHFQ1YNNpT0qbcW6rONSUXF4d58FYjOsM4XsnjRDVEfBhDriLZI7FV1BLr6c_N9UYznyjlAz5fawI5XYYVJtn70CQw5y.uF0MkjNcbOPURLBL_SqBCxFQIymjUIFg3kI.XOP77wipRrf._EQRFOqNwodHPDrORCdhl6bTp2sGeE8zwVcsWH2Yzj2fqGBwNAaF0q12RgEPuVPS.P7z.Jc.RcQLc5q_vJjtrw.x9kAKbVKIUUoMDRt3DX5W8BB3Fxj4Z04Q6Gy9QbOlYfF2wI99z98PBULCs7Cz41H5g7iUpQY4ZTSzYdrC6ccJBW.wWD43Tc8SXd94rnjuyg_rc7hbtwgxGEOKqoMu62a6R0LDLDpPRSlxHmAsYwFR76VJ7SW.fvvKjNdPMJvtiM_z6IhsokOWSFwv8l.cs0bE_zwIwSjxz3F7GQv3HQ0PyaCNSuwNpzLU_stYXYZe.ZnCHMN3iap0gt9lW_d6VcXwD2_jSPlC1P88.nD049nTLRfa63YD1LTvhD011yVEeOe_a1pCv3QX.Sq0PrbVQlSP_7kiRTpMnt2kO7D8sZiPu7De15HLi7uf.ElKy9RnabU6x8euinArSEcNXYavPPRLl7m960XzLm.VH9az.ZUuRlGGf4Kg1txFt8YJ1D_ree17ByZOHFb1kWhEEKqniZEcIjA_SaD6W4XrB2fCCd5aYW0K4eQJuj4Ft.OH5wOQSWszPolrOvz5oUIDeOj3RFYhp5kAa5mRRu2EllBTGXHxEO0r5x6cWg3bGVClg6Shq6XKmZLSr1iPsT2lQEcTkgsEpIgcBS.ygTX2A7rXp7RfPGMvy_PyB2OuGOgWRGlSFjdvzIdqMsXlcea2YUJBQNP.oCx3uS9v9M5SHhYwqM3LHh8Nx7NVuSrBdHxrIqZohELoKWs1rAFHmmq73f_H1_Q1ZFcyeK.x5XEVA214MnRXp4gpZe3EuHUAT4ev3PcH5OzzXPTaCayUPuvr7nrRb8icN_cZDua0nYnbywjSgSLBQX.Hovaa1bKLjyvt61MRodEb5TQE9_X4knY9YpUzgHqNkvZXYzK8Q4yHs7erjl5C8VnD1uTibednKUTRNduS4eq4ntx7wGyJ.aGKVyfvIDhTTCVG5z8YmyZ0yCaoXKeYTgXFvGWfFJ90EqRa3kOgqXr0ATyfob2Ai5h9MjJvEt4uZ8vpOaAo8M2xvZ7lX69ZvVEf3w.muTotFp.InKu5BTiPgeBM10D_xXaGppQfy0g4j0WoqlwJywz4jrjF8uSD3mwiIdwlM.UNR.MiwoQzTsqvV6VRKrHbJsEBFJ8R0cuC56TTUsBdv7pBXFQ68k7IFDTUJqEza.YUkEh9Wgx2qlwpXiAI3kOx7F5LD1Krws01EP_.MiCaa0ZHWfubOet.rx1NW2UqDKUm4DxEvsusx2xOI_IOtVTAM925KopgblJdWIdM9h.rVtZ7nIe3IS4FgIDoZdy.2urt9ut.PEnlw8cKvD_0BcPCmC0ecfpFjclWV2t3jrQQEOuPiOq46pKNP7_rIx1SO.ICJjdilX3PmP24j6H2OwLcYeYnHjOZwMfFULkPU2EK8E3DO6fglXzl42KdTJ2EsxyPsevMxJUwu5NxWmd2h5b76T3axX3UtI0PoYGQ_50MxshNwgts9Q_S9oJbBToxdYq409Ui8.yRiyQtdQi.puZbX.JdBQ4zk74FDkIY0VPkqRDSlifoeSbmUUFvdKhm_s40OtYoEimboz2i1_qqPwvFUKrGUULfd.jvOWR8Eln5HFv6mueZTQAK3_uxv92blfYDl3uoiBY7QAyt7PDlM.1qOuiG4nS.SbER0RoYrLiPQtDuCuIU3mIUW5b811Zy.LSp2QboasxGzKUaXyz.zbqKs7zvOcxrEEkIF7IPVVYm8ArgAzRSkKiX_DyjgmPlUdOJyPkrHU8R.h79xhuk34z5XCNaalLIgVG5LVAl35XXZLn4xinKLi7jRem6VjdWtPCAaV2ZyCWFBSmbMsn0J8g.vrDneUbUwS7O8mictQ_6ygWSmFpH9ZF1Iv9IjwOBFUThiVEuQzW6Xqb8KEKr2CfQ_ZkrvC0QjfBNC.Ae.B.8t9koj8SKf5K3eNjvFbu8Ai0LnmXR3OnGhDiq3I85CRa42cFZc6XL5RNFODRXrOTP3Grk3uA.o05YOkf7kEMd21BMWbMlqLRLtsQUZDEXo.1Xsq3PND8ISU6nyUpUvq6wXBr5P3d00qTm5uVyxgascYtR4hyskZ1s3X5FeaIczllB1OfCNllqyPFE_yw9GaG1I10oqgYSvfXeik97o672ub6VARVl2okIIAAADFSQmjCQngSaRKB0C5bnlccTW9hNZXbPGOTV.85yRioN7dGSrYyzen7WgZuCi.XkyfoyMJb.l7arRYfelOcdk9nB_iUcAzSZETmNIrSfVUnEU8WpOPnl7l8T8Mmi_zhT1GiJ7RSaoEUQ79f2rVVXf8AbnEBwuaH3fOzMY0nNaHCBGK34Wr.c5gAFKnt7uIRgAZKH.lWTAreNjKTTg_OXv0fv52DKKJMXQWJmQtDY0F7h6i0Ot6iqR30.vFBa5K3rct67klFgWWOqp_gUCFgA17Kz_y.TwzHTVsIq3MV_P9ZHh_45dmRSvuhEFTvwyqo.IOmWWJsGmFaHoHBqt60zHKDYc8eubJ3FmKUnrZbt8PpsV65lAFh_e3Lxi2kZ9C6qIeh6xArUjc8bhOAaJNrtKE5ovMuEWcAZ_84ZzsnI5j7DvcOw44voYFyfpJHURPl8gJqXobKQsmcOwRx5qlPNOC.ZAeRUGWBT8vUTw2LAgc_q3BOQbDvuI4Eo5i4GiwbvrgvJ_u9GVA7hY5KeXVGzEXR9kulEPpwJQdKsvDpN1puP3lmckFLQl0RwwGd5oxVqJvnvrNYX7PNLdRNfDP5KjxhbAA3oLVSYCTSWqF0YJtI8redEt9HRSauZYrq3v3tBODUryHL6DrN9ZcMWnSXatD2g_f4qPVjNnRIXrQRyt0CZ3Bq79_zGc61izoZ_yWcv_dBLTV.GWPcVXvSmkK54.PNbOiINCP8kKEl7OlOtNv2F7eBSiOGxKpAQ9xY0xgIA_bk1_rwD4.nUJVg7xP6cpLRO0FVdTIuFJTNNmr.y9nyBqhJIihzAP3b3Eb2RdSQOuJTjMMS5lBjkbdvOkX_VYZhd514bXS_sx.RXCYBvnj1Ujh00B0dTyMEVqT.UF1qwVl5UdSwIEEcI2A8XRO0DKPBYI9o_DPrqjL1SIrVswLfwlMP_wQEwD58RYPJ_YQQYa6W39T24pS7SUb2d3kHl60C5Or6a1B6lVWZ6IXJIgaDfOhJHEgRuG5IvCCyitRq8KsVawuNVpUhlyCmupvZxfClANBpQnyznlCnOnPmqS9iHeQpb82OhUKt7hALAvjixm7fDSuWufl9oGkWpMM40ppToNIXfrPKIaQ_S5OnSERPZYXcStSa95OI3UmIyE4jf1QCtCeqpB9SbL4ubhkSRTQTsUR7cwrtNhvsPYQeqS3pI4Ieki_d9ADW2PmxHgH01VVoH6VRchH.CpKTVkwDFpxfoDTpuo3PIBZQMcs4IaZUbm8tejH28yLzRY8zWTBaJmYJOoCIVYQfC4myOuVNLv6J8K7ydKAesRlIL0KfeugAIn_w3VTkOQu6xWULSSFIXyv8.E3w5YZRrj3.V_aRX7QeTTQTG22IWKpcl02hKcXnmKJ1LWnvRef7DI.drJJnQqvNQd.l_4w7Fl.7MjKxdsJvCJqCbMS2RG1rPZ8UVr8HIZZuYfEIu.cIDBfAmK0ycIzMKIGSQgbRSdD6_n71hlwdGRMBpA40z59RHFcDruygxxXYpuGW2djocN2TdaqUunCHW9X05J7OtxWy0YTWwni20.Zgey9fFZY1kPlvQ4QSxIj52YWeU8S5Nuy2gzwzX67cP2zK_F5YS0eqERY8GH6i4Ell6UbjzLljviS5Dx2X1NRvGA0kgzWxsYirERtZ7lpkSK4UYFxZayRooa4PYgzHPOn.xF..76CdXqjQyDYaYjJ0zgso2uZGtTSSLf_oj1GbFnmQT4t46ZtftXXex5j9rml9D2IzjV2o30DepNynnEffk2Jhjfh1yArSF8FdgGepu8OuvvsK71v8dvr4dZS61z4jbepCFz3rqs3lLqCGSxkBMq.VnVbNqdUkaFyFLE_JdQv84TYumPy4bQsb_zZm4HFLsy8tejeWNK8cGmyNtfN7DHg.DFH17DahOtzS0U0AJOD3AY1kHmt4ScjTvLL8T2CEGcoghxcRm4H3_dBwQM.JvPYMHwsJxVfigrFr5nK68vPuUYCIGX8yeVlBelKJWWIUoLr52_CV1hQBbLYbAm9wEEa8ron3wfSR8RhPvpg7uHjzwlBhlklNxb14obkK.4ULksXEU.ogFR3nJtpMO9ClZZRPCSq_.DM1j9uJooOZ3BhzoIJD1HP3FMIwK1RVu1uwFuT22SVbigCT1_S2NzxDxDmFY25v2puI.51CvOOCdW4SiUlkRZ50vQEoPP5r3TCRD.NmybP750NB6LyfrAXn6b62UIKZ76zZcVfCQdIJb6xQnSV9N56YwzCA6MOBXNDIP_v3z2vo1JSx_VRP5nclEU9ksNVaNEYIWgcMNt7lE1V8gD4IXrmzfydxBehtCHbFhfqMtmBn4oCO1bymzjG_ESbwSwG6yXhemjGiCAM.J_s1zcmGxueSAXLLAD5GDuCU9URLpSLIDTZsJaGx2Fc2P.0_CZKc5x6bOOwGSfivTAa5JYHYoM5ukJdfdaQt7sgzkBrlIVAzlLTJRMFsGBGDwdNj4vHih1imsDyfTqie7KzvUQydUUZUXGntf65zd2P3Zv01jljrXzSh2MENYyrUQXZbE75uaUX.S1jEWSHH_OdUgDdCLvlr2PR2jUmNJCXmJnYWXARdzFTL4stTyl24yPwJm.Bo0Dg0KYe7aNMpktONlhwGZo8aznO0ufR6lfgxmfgFK2f7w57nAxxw5L1ESlSqD7egRmEPu9sJctaFYEjBkIVy0TlDuRBiNc6sCeuCbpWN8HP77ZGoMVRSmR6gZpjYdSsng7aQoWZTlswtxhWpJn0ZZiUOi.N4HG78u71k4T8X7rlZPiRvt281Lw3Bzm7KX6ZABZVdDy026xcN7x2ZM7yM4mVat7O3HplToL1j1LLWQ.7CJuo_2x3v6wGbTPg9zUxXatdUkmbxqVbqIEPGKZ3TGLg0kT0fHvR3vFEIEMggSGd4X01Oj1B0TwlcLAJ_Y1hDdHTTYyxqWtfi1i_uMqtG6skpnZjwTBvz7vz8fHxq5HEBbY3ahKvcLbI9Bb3Oxl83K9DgrKgxQoi93YXy4BuCwJxNgRn5W6qw3EXacOrQFUYwwhk8rNukeK2uKqHEABZV.ALR71C0aBblBL7pKMN.T1dCZg4di0mXd9Q3ZDI.ts.es0CZOlyYcOp54A8idrV85olqhZgk0mB36kakhWZGm923OU_nihvBcPHDaVWETlZIvp2muPT2tuq6BF253gAS2EB.j_KlHCZagERb_RHs7gRuEPVO6kuWjKZuaK9puxVzIgc9rSKmpcB0c6rLNazCnUGp7tkQB2a.SFoRzNg1fdGiNJYRyw3xnUjXwV1IdWkR.dj5S284fqw9_v7.wmLZRPTbYQcB5UAL4kFzyTlPhzVow3BLdvE3rIjhUjWfnJBnfi9mF.trZADOqr1Rpjzf1rGXNZWy_Lu8hgWGRxIuVm_MkzBtc1A2SrW9p3qQxfTGfbNPRnORojWibd2eUZP3CmxLoUGWASTybPxhF6UZ.FOHQg.J.1JYPT5t14ambRbgc6RR332SC.hS8T3w9js0NfiHzgOCdOqfjmqK3ueJTvcGRLrVHb6LDkTOWPZlFm_CodDXDQi5lXlYHJsN57GW3WI_.IVYe6Qnp_L554vRKy96u_c_QRwruOcul9ZzTb2vMJkh.Szgx_POp4WbIjYEKbijuZ0TDwxNevIYj65HSK.J0fDljoV9i4vbgDM0A1_dlHGRHAX_3zS7U9iTl1M37kGtBBd5CA6LneJuVc9Afpfww_bk74Km6ZIcIB4YmpYLLLwsfOkaP25_uXciCDGp6g4mmW4NTD28vNeL.sLHKWBpj3YpHOSZ0vuUoKkMS7P_UOdzohnLzsq1gTtcJtx9yQ0EdsAM47DQ_An8yXtQlvPg.GVSqB7mvnWdYuxoq4On0ws2Bv1FtOJF7jMb6q1Qfv82KOM1A1s.tbUCmGQQnoV.C2fy24g.6.z256OypXk0UmxXJZx915xywSSivU0pE8QDbYFjGsiSSs0WzEHwPuhw4gXQDu8I7CndvydIjOsBFi.L15wWN8H9Ju5bmn.xpDn4ahRpkVytGglgdQs1FFIPu8yosrcxDoxSa1OKRcEroitw4rJQD8K.9ZqSKAAY70slj6KVev9I7qCinBVEV_NvDR93YAQwEd3Kxa2Ikg_mrv9Yac8G0weE0EMe7pkjsFItW4lYDDsu4lx2gRcFe_0aAllEkpiobPQbDYUxSQOL4Dkjd_GHmU3BUqyIv6GpgyeWGQdStsiUxOiJRuWWO7hRy0Cx.LyflC43sdGaDGPVfUhX7NvnOOmzHOfQjj5oMFYg_p0_0PhRnqUbnt22dqhQyDdCzz.SGhW4oiQG3BQWXOnp8zVsWQ6lwnwEAxonSeQ4UFsDUTEr2_KLgiiEjBVstAQRzHDN_zF8kp8.FVO5kwH9H6Av2zblwJ1PHFlC97ZE3eJcCebDuAk3iV5YyoVJa6Ve4y082bLE0UNeKqA.quL7__Avkuq7KHddY_jCKBiULhM_dDaFTU.lRGs9pbjL3CeBnxUPwmn.frhM_nkY3hSE_554kQPnAIyIDlRRjjcmjy9bYkwOwNMMEMINZjKuT2Mv2UOikoFmI_ixsb5uvGsGYFc1J1Uus62Tuu3wLr2NqtMjiMa0e1QBmIf_mzNia.Jc0KGwQQL_d68hClrnzyJrJas3H90I_CPXYA1PVb_TOzR8LvPuZOa1ghLtw1Cj2ootU3XUjFSNrMS4V7qDT8JDJGToP8Xyvjg3fmqC4KgJUw789LfHo1G5zaRhtnPXZ_scPBUMqFuiCajS_XYAlGDLkqxE49fpXGdWEuntmsYMqmoOrBtaXPWYhSIylEKzf_KFrrs9tPXWuDX.KCjmJ63WIL1zi4YyE3VMcXndCHcH3O1QCZGEb3gTO42J5L.HstEf3a68W3eJiBjdEJs60be74NC15Q9szJARWvoXH.ZM.VhLZgwY4QsBvRid49q4w.FOWU3_bogyAyZ7qbkI5vb8xw.bxNUMh8e9TLh2Gj4khZ4mD6s1X6yO0jYpqKiVbPsfAp1LEVnpsgRFSBv2kqznZMHu5Beb6I4ChNo2_zSOU_PPg8g8tajkBn9DFCzre.SW4JsS.c.kNrWbUMB1bUnpeTQPXYMWXqsbjQ8WU_64SBupKt3yiL3vUbTtupJahSS.uA9DIRRZkaOoZK6UtqV5cbSVhjRn_sDKvfmHoZ731ymtYiCHXu1Q0j95kJR59NGE2PHTSC6grL6VnBZAz_I.RFQooHaWOMBzNaAT5My8DhwDPQX4nKwJw1X3jyT57RAElIHuREGYSsEUp3ZCiI7h2Pe16omGVye43yP6_ZNtn5H2LcJpOHagw7cAUTA1DatowNZgaEKJI02V2v0iNCBMEBCQWjfAmIeaxwdyBSjOYSLDWnfljo8Beq4S4yQB6uZTyx_4YTtokaf_Bh6R_AhZo.I0FUAUG4XnvHnVkkFYHtmqKu5kcJqT8V8tLczbB7FD9_q8OadJ2Wo7YUx6vEfvlGWMY37IOpPmvFiMI.kzSq0nh9p2p1kSbaMT2R.fYaSLvmpBQXidvzBx24o74U7KFeOoSKxzvDZDx5oDs6klPSRt_iDYxinHvlyjr6dNKKbU80._VIjpIQ.._RTF3cZE3gjpT8WC6SoMVRC.wh36CfaQLVp1tDqObTPCC8uXYzaRhv5dTS8SsNpGGXCTwObuWsLz40dagE3jQpjKoDv42MUJiRkPRPFcgA1LrNUTAaS4iI0BbIOXP879fBzhzR5Jr..E1qWONWjXa39YLIDuE.xapOga.UMjMGHop.X1HUX64HhGGLAyvWgw6.kEC9rD45fXAjtq_5lQrOE6AJYOyM470hII_uLPHReEEnx0z_oMmcMX6gEskpkcUFckyb4uTqcENgXvwYmTULNYmR9s3xHJHjUK0rdp_eWwZ3Ll_7TgAIy_zjhe3rbLAczQM0iuK8Q.KVa_f6O2HUM56K3e2Jl9XNKraN4X0PU_2KZhAxzNIlNSz6ScLSC9xB6WCtL5CjwSRPpRaBDzWvVCN0DkSeo_SRtDo6r9e2ghFHpuH8ZthYNPhxSVdu0vH4_y67O.w1sJWBdmViR2vs02RNACQ7.Jy.STujfDD.NTr22Ti6pYRxtoMdPxZ5RZPbj1HJoxXZyl4lkzaaEdGO_jZxe0eTixoLUwx3yMsWdui.vD9D68zjtNMB9JOInwf4kM09cHcTSLVcZqHpLXmvTUGcrrjKUkcaub1wWHgcipZjigbZOrDMLWfgN3Y88inbx3_O1NG1AdnoQP5wBimI2eFzLjZnSitlhIi6zllNCe8NwUa8PFFBqE0zqC3YaOa2RXxEf06n3zEXdZzFRodpAn4t77te82rvxYJS_CCp5_B5pTT4LjDFxWX1Fy8b7QW4qnfziyE9fOBHoZUGpsIpWIZUgaCd.AVAWkzirrd4i3mNXhKj1oj9QPZHPoEc8vF3zcZfmj8VJ5b5AcziAcQq2bzwADlIssPV_MA0DiKFWjJRkMic92ROKGciQD.ynSnedgki3.eJmXiCa4pQdhM0GQkiAbFzowVxM_TZXkx.hv6RAcahkVSHY6asubAkz2r07fywxvP3vZcevrujkVa30eI4XI.dFHu.NshPR2zgn_yRdc2UGTPGrI5Fb4KASKBhw8XQWZstK_JyqmZ5jYEZ97azTXabAmD5EMiRsVv9L2omaMQymePfvZiAvi_0DT3AHqY.SKMNtXZK8eIl.TcqWaGUIZVJaQOIqjVnz7GfVvQC4cxxBgURiPHtpeje6QROD1rSS5VE8IonxqDi2n7upiJGykGam5uueIIZd0BLn17MEPvvqVuB5s1UND0nGuoOpLnqAIIybzJeJ6M71cRdu6MN4BBYt0ktEYw2EorOqbGo3UNzctwzWK0WFP_8hQJ.2lPy0p7SBaOdNhGMTeaHErr0jwpz9QPA9hz6u19BU9iC3VI1I7tnHRU1obKgD6V1jxGFdMl2uAAwHYdjLUeIlOWqBWUkrobxFIu3_LFmk7vGAti1kNHwHx.WfmVPHP.yie1GjebgCZQqZeHG9RUatoLExrcPqkPmUPwhiywY3V13_hlWwDEE5yeSDKUjUmmdgP2MrlwZBMcY.0wigifdW0KMe_XdUOvdy571EvK618AN37ZgfSA1D3OQBy091M3s8XuVkiEBgvUYxxjHIjXz7NvzB19L3acb_KReXVbA5X8g0oTVmkMLhJRvIRBdOo0KOvVXH6rEj7Rcvm__YpiTZIKw3wNTgiJBxGEohst2UEegHzgYxL8Z95dlmRoj84B97s47kk4iUNBjXt7prxWB5X7Ag.P7gkUN55HD6RkCCWKMuxWhTScij6bev_RWG0XR.X8UI4rgWk4X71_DSGRpS3EH0Zcpr766JeaR9OhG0eWaQqhNOJN.HN2HKx82DIZL0_4EL2keEFLmJUoVLKyVSTYyRjDgK0bU0MEdHvC1IUYxUBqJsqf.TEkiaSRQIc0H353SQOiUbXUJOiowFkQHINL7A1SNmZwudUpF.lVIlU9u7yDiejBp4tcI1fh51RNxjYOnXKLJ0hLXXkqcaLoqjEyqEg7.Yb9R7wRDChK6I4HNfvqaYWEibgWL7WZDkZfo..zILzHdBFCpMmhclAQwLPpKc1.CKlQjl.V_bOMNrZb6y.gxFo7Lrb9Bq4VkHX8.raSH7LWnhnCKfhclIh4RJ0pl.LTEmfr47cKmuJGeyx8hpZyKzoOS8GVWW75_lOip_uMYyWtUaPm_99BaAx7EHCAfst3Oi.tSEwoLxx1MZqrM0Ea7WkOy5wFEPpZPN4sCieHwEHgd3AWbmLZSPwNipre.ZxyfEuNA1M9rOV7dGqJaIqVlOMQISkaZ22.wKGlLGEqSfM7QKekMxdisMNxShUxJOB5HL3w0xWVh2_Iiws0lM83MkyJGLgcDclMknXtq9NMXQZ.fMlTdPqS.xfPDM3bsYKODgPQrEXv8RyMBB10uQTS7J7.vxkIjn6jAfFQlef4RARQMbqVxCN8VOsGZIDqj2FIrIje.RVt8B3FVjhu9ATOZ7dqh58p6zBjSnQ2R623ALwSRvNqjqjD6vBFfh4iUNenLvewHOo45ZWiN14IRiqpc9tPcGRyHsNHOD1.nmT_tzVPI9zvEGfZRuUQWvk7j.NmP6O.LwQxrcZEIaJPsCCLCUTM4ggGklR5bFJc9UYLfsqT6KLP52reSgbo4uSZv6UCVGnFgLhopvDdb7ZEes3IaekMLpgtn3B7Nt2Ff1db3wnVBIlrjDwrRyMPjaaMjpDJeY.WtMU70sFx2eDNeO7_TT6jjzfAnc1NV8I5kGXBKuB0SO_rYrKIeL241ahb91W87wXWxP.U03myFb6dJFfSK1ikHq8oewHc..lYxCgE1r1ZPEiVz6WsJaf1P2Y8B33joafgGLp9.HhLWFWs99Z08CktLaH6hzzAzZd0VOdavVnRpsmiofRMPdqspufbeQpaZKWcZJ3jbEYAeIQMFK32ul.KwOYQkl95FLy0vlVyd4Z7VfOWWxhz5Yyg7oN..77S9udwXlAnSPw6u.CkGUniGmWfCbTI3DZxsNaGdyhClX15zoRv_fbaVNnEYVBAY5lRdU3x_bRHwsG5X8tLnYWVjmVD5mTdg4kXBeF6WZIfnbj6GX9OBn_JODUKbHLhveMHKuZFBkcsajFrwssWFmxPuSyjpeN0KYNlTkTEPj1qnDZ0EKD4n5K46m9sLSRkY.07bUGJJEChtecRToZRLzqPgarjoO1hTtDso6bdsgDOyPjl8FkkrLFerpTJ1XS2C8byH.bqNRkWnxVA5U9PLnmjzjEloAzoYqq5jZr0mvJGKHz2VgzO55H7EONpzqqO97M.f_5LCGbmSsw6s4dc0NlruAlviQ2lAHj8wLpiKAwz2YSlbWKmzZAzGtqKcHjyqn2ijLewZts5y1MQgROGpPzrdSatrKjTycBZIAoilFfrvZgAJ7JgO3q.otXozr.V0QH9H3YVjRCfIXmPAPRWQ9BJINneKEGC6xKXTkYEYoKy4V.Atihblw8c1g0jikcDr10YE2VVpCjUGTOmCuPOc5bi2cdQVLR8Qp.ECk0lE9zyxCIL1mZJFsuQ3rRNSg6BQDNVlhpwR455IcmbTOj779lM_Bjuc.SgjQRRHAyW6iiRcosyjx_bTvOX6KXpJexs5XyhrSLI5fAcqjFfunUp7_M0ZoVNoELdWmkbNFOrRpPocfV31XYTyAk6_wUJXsFnbOaR1l_D9mqXUoVok737x");
function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text)
        element.textContent = text;
    if (className)
        element.className = className;
    return element;
}
function button(text, action) {
    const element = node('button', text);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
}
export function createFavoriteAtlasPanel({ favorites, openFavorite, displayTitle, generateDraft = createFavoriteAtlasDraftGenerator() }) {
    let rows = favorites, atlases = [], busy = false;
    let activeEditor = null;
    const root = node('section');
    root.setAttribute('data-rm-favorite-atlases', 'true');
    root.setAttribute('aria-label', __rmT("0o5D7892xk52zFI.oSk"));
    const style = node('style', STYLE);
    const head = node('div', '', 'rm-atlas-head');
    const status = node('p', __rmT("IkuMZ5OoQ4P9aI9HJQD"), 'rm-atlas-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const editor = node('div');
    const list = node('div');
    const add = button(__rmT("XN8Cq90tsAh"), () => showEditor());
    add.disabled = true;
    head.append(node('strong', __rmT("LJUNK90tsAh")), add);
    root.append(style, head, node('p', __rmT("_sBYRMtADeB5fQYdyC.fsiQK3EvOrkqYhAk7xyHAoRYzz7yO7k5TawrWCkRbaU07l.HY3h"), 'rm-atlas-hint'), status, editor, list);
    function fail(error) {
        status.textContent = `${__rmT("BMxZaA26WZY")}${error?.message || error}${__rmT("7FLOIoY4GRvdJoV45x7mSTcbJNWYwQlF29E")}`;
    }
    function open(id) {
        Promise.resolve().then(() => openFavorite(id)).catch(fail);
    }
    async function persist(work, completed) {
        if (busy)
            return;
        busy = true;
        root.setAttribute('aria-busy', 'true');
        const controls = [...root.querySelectorAll('button,input,textarea')].filter(control => !control.disabled);
        controls.forEach(control => { control.disabled = true; });
        status.textContent = __rmT("cIFOAEHguFOo8h");
        try {
            await work();
            completed();
        }
        catch (error) {
            fail(error);
        }
        finally {
            busy = false;
            root.removeAttribute('aria-busy');
            controls.forEach(control => { if (control.isConnected)
                control.disabled = false; });
        }
    }
    function update(atlas, completed) {
        return persist(() => saveFavoriteAtlas(atlas), () => {
            const index = atlases.findIndex(item => item.id === atlas.id);
            if (index < 0)
                atlases.push(atlas);
            else
                atlases[index] = atlas;
            completed?.();
            paint(atlas.id);
            status.textContent = __rmT("qMRWpIBeM_4Ssof1");
        });
    }
    function showEditor(previous = null) {
        if (busy)
            return;
        activeEditor?.cancel();
        editor.replaceChildren();
        const form = node('div', '', 'rm-atlas-form');
        const session = { generating: false, cancel() { if (session.generating)
                generateDraft.cancel?.(); session.closed = true; } };
        activeEditor = session;
        const heading = node('strong', previous ? `${__rmT("Mtx0jqVg")}${previous.name}${__rmT("Yvk")}` : __rmT("XN8Cq90tsAh"));
        const nameLabel = node('label', __rmT(".Fa9pUwR3Ml"));
        const name = node('input');
        name.dataset.atlasName = 'true';
        name.type = 'text';
        name.value = previous?.name || '';
        name.placeholder = __rmT("MNkJSqu3gB6N4mvPoJNvRf");
        nameLabel.append(name);
        const localStatus = node('p', '', 'rm-atlas-status');
        localStatus.setAttribute('role', 'status');
        localStatus.setAttribute('aria-live', 'polite');
        const draftSection = node('section');
        draftSection.setAttribute('aria-label', __rmT("AM0y5jDd7sqb8RUR"));
        const draftHead = node('div', '', 'rm-atlas-draft-head');
        const count = node('strong');
        const searchLabel = node('label', __rmT("PJvh8dPxc8p"));
        const search = node('input');
        search.type = 'search';
        search.placeholder = __rmT("DJHJQUhEA7aKlZis");
        searchLabel.append(search);
        const slotList = node('div');
        const preview = node('div', '', 'rm-atlas-draft-preview');
        const editableSlot = slot => {
            const originalAliases = slot.keywords.filter(word => word !== slot.label);
            return { id: slot.id, label: slot.label, aliases: originalAliases.join(__rmT("Yis")), originalAliases };
        };
        let drafts = (previous?.slots || []).map(editableSlot);
        const failDraft = error => { localStatus.textContent = error?.code === 'ABORTED' ? __rmT("6bMi1XU5W3dO7QggU45d2uu.FqrfZq9j6Svspf") : `${__rmT("BMxZaA26WZY")}${error?.message || error}`; };
        const liveDrafts = () => drafts.filter(slot => slot.label.trim() || (slot.originalAliases ?? slot.aliases.split(__rmR("19YZeiz2U8UZPtbv9ew4q7EAqSrmA99w7FE", "")).map(word => word.trim()).filter(Boolean)).length);
        function slotText() {
            return liveDrafts().map(slot => {
                if (/[|\r\n\0]/.test(slot.label))
                    throw new Error(__rmT("NurJLS5aRpeTI2R29w2b9VkLtDUk_Z1aLA4PKXqirYZ.bh"));
                const aliases = slot.originalAliases ?? slot.aliases.split(__rmR("19YZeiz2U8UZPtbv9ew4q7EAqSrmA99w7FE", "")).map(word => word.trim()).filter(Boolean);
                return [slot.label.trim(), ...aliases].join(' | ');
            }).join('\n');
        }
        function filterSlots() {
            const query = search.value.trim().toLocaleLowerCase();
            [...slotList.children].forEach((line, i) => { if (drafts[i])
                line.hidden = !!query && !`${drafts[i].label} ${drafts[i].aliases}`.toLocaleLowerCase().includes(query); });
        }
        function paintSlots() {
            count.textContent = `${drafts.length}${__rmT("N_wA5dPxc8p")}`;
            searchLabel.hidden = drafts.length === 0;
            save.disabled = drafts.length === 0;
            generate.classList.toggle('rm-atlas-primary', drafts.length === 0);
            save.classList.toggle('rm-atlas-primary', drafts.length > 0);
            slotList.replaceChildren();
            if (!drafts.length)
                slotList.append(node('p', __rmT("0MlzHIjnNdXLc9h.rVzLpCM9LBFNo1yo68k5fTvuhjl7rhRUkPZZP3URrgiqBvkC"), 'rm-atlas-empty'));
            drafts.forEach((slot, index) => {
                const line = node('div', '', 'rm-atlas-slot-edit');
                const titleLabel = node('label', __rmT("3NyyacwR3Ml"));
                const title = node('input');
                title.value = slot.label;
                title.dataset.atlasSlotLabel = String(index);
                title.addEventListener('input', () => { slot.label = title.value; });
                titleLabel.append(title);
                const aliasLabel = node('label', __rmT("MSRKkSSNN7JBBC2GIlAviI2edGVfwh"));
                const aliases = node('input');
                aliases.value = slot.aliases;
                aliases.dataset.atlasSlotKeywords = String(index);
                aliases.placeholder = __rmT("qPuBL4.3C45w09CYGGtlXqyocyx6JS1auh8qsz1cG6P0tk");
                aliases.addEventListener('input', () => { slot.aliases = aliases.value; delete slot.originalAliases; });
                aliasLabel.append(aliases);
                const remove = button(__rmT(".MzhPf"), () => { drafts.splice(index, 1); paintSlots(); });
                remove.className = 'rm-atlas-tertiary';
                remove.setAttribute('aria-label', `${__rmT("EPJMVWPSHKG")}${index + 1}${__rmT("N_wA5dPxc8p")}`);
                line.append(titleLabel, aliasLabel, remove);
                slotList.append(line);
            });
            filterSlots();
        }
        search.addEventListener('input', filterSlots);
        const addSlot = button(__rmT("E9uXAdPxc8p"), () => {
            drafts.push({ label: '', aliases: '' });
            search.value = '';
            paintSlots();
            slotList.lastElementChild?.querySelector('input')?.focus();
        });
        addSlot.className = 'rm-atlas-tertiary';
        draftHead.append(count, addSlot);
        draftSection.append(draftHead, searchLabel, slotList);
        const bulk = node('details', '', 'rm-atlas-bulk');
        const bulkLabel = node('label', __rmT("JizRFKZpvtL4taObKVZiyrE0iNPkP221ws2JqdW7"));
        const bulkText = node('textarea');
        bulkText.placeholder = __rmT("TRNYbGVzIRRSbti4bSDF9RJ.ydQd.mzGMhk_3Sp1y4I65gLPRVEOjmly6BKUKnxvNUFLSnzexqKs_DJ3TdueJh");
        bulkLabel.append(bulkText);
        const applyBulk = button(__rmT("792b4HbI0RS9z6uE"), () => {
            try {
                const parsed = parseAtlasSlots(bulkText.value);
                if (!parsed.length)
                    throw new Error(__rmT("avlokBFQApyiMmMYr4LOj.qi5D0rrk"));
                drafts = parsed.map(editableSlot);
                preview.replaceChildren();
                search.value = '';
                paintSlots();
                bulk.open = false;
            }
            catch (error) {
                failDraft(error);
            }
        });
        applyBulk.className = 'rm-atlas-tertiary';
        bulk.append(node('summary', __rmT("r8c1fmnoneiV0cXJ0a4tLk")), bulkLabel, applyBulk);
        const generate = button(__rmT("2hFbZ4yE67Tp6zo8l_h"), async () => {
            if (session.generating || busy)
                return;
            if (!name.value.trim()) {
                failDraft(new Error(__rmT("Nc8jShPMnz1BeIJKri9_vxEI")));
                name.focus();
                return;
            }
            session.generating = true;
            form.setAttribute('aria-busy', 'true');
            const controls = [...form.querySelectorAll('button,input,textarea')].filter(control => control !== cancel && !control.disabled);
            controls.forEach(control => { control.disabled = true; });
            localStatus.textContent = __rmT("bl0Nrpan9bFQYycUHh7VZNdTxqFv3yF2SzyBkf");
            let observer;
            if (typeof MutationObserver === 'function' && root.isConnected) {
                observer = new MutationObserver(() => { if (!root.isConnected || !form.isConnected)
                    session.cancel(); });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
            try {
                const result = await generateDraft(name.value.trim());
                if (session.closed || activeEditor !== session || !form.isConnected)
                    return;
                const apply = () => {
                    drafts = result.slots.map(editableSlot);
                    search.value = '';
                    paintSlots();
                    preview.replaceChildren();
                    localStatus.textContent = `${__rmT("iFNca4tDHKG")}${drafts.length}${__rmT("6Rx6H6UdqvrjLyXmxJ8gtZJAN1YsQYql7hBoTTKu7rFvQwq79EBr7f")}`;
                };
                const sources = result.relatedEntries.map(item => item.title).join(__rmT("jvk"));
                if (drafts.length) {
                    preview.replaceChildren();
                    preview.className = 'rm-atlas-draft-preview';
                    const actions = node('div', '', 'rm-atlas-actions');
                    const useDraft = button(__rmT("MdXZJHbIM.0b8RUR"), apply);
                    useDraft.dataset.atlasApplyDraft = 'true';
                    actions.append(useDraft, button(__rmT("sg10JOA7LEfnlUKE"), () => preview.replaceChildren()));
                    preview.append(node('p', `${__rmT("IxkkISOXnHQBTh")}${result.slots.length}${__rmT("fiXAidI3i8LysRrXND2_Lk")}${sources}${__rmT("jzk")}`), node('p', result.slots.map(slot => slot.label).join(' · '), 'rm-atlas-hint'), actions);
                    localStatus.textContent = __rmT("jz7FJzs0pMAz.qFE7Kovp8roKZoaFjj_RtwHXvr9gG8");
                }
                else {
                    apply();
                    localStatus.textContent += `${__rmT("4bF84pqy3wV8Vb5D")}${sources}${__rmT("jzk")}`;
                }
            }
            catch (error) {
                if (!session.closed && activeEditor === session)
                    failDraft(error);
            }
            finally {
                observer?.disconnect();
                session.generating = false;
                if (!session.closed && activeEditor === session) {
                    form.removeAttribute('aria-busy');
                    controls.forEach(control => { if (control.isConnected)
                        control.disabled = false; });
                    save.disabled = drafts.length === 0;
                }
            }
        });
        generate.dataset.atlasGenerate = 'true';
        const generateHint = node('p', __rmT("l2yVnlXFcapI.7pCNyCD19uIgzvYV2JY2ZcqYr7EJrN_MQhvPJD1CpzGVkYDsps4jkXcfPllIqGp2TbX6opx7kp0bS95Slj0KWeeGheDiqVXwgkEvv7TSalXllI8QcgOFH2ihcAc"), 'rm-atlas-hint');
        const hint = node('p', __rmT("nnzK_O5W0XVasI6ZvmI.6SXPIYjl9HSm96hbyXWQuPL1h2nNw_Nj4__ltbwgeDZYaSGouwrEt.3TBJpdAu.16gWBw5CE_FtiANA"), 'rm-atlas-hint');
        const actions = node('div', '', 'rm-atlas-actions');
        const save = button(__rmT("UDZraM0tsAh"), () => {
            if (session.generating)
                return;
            try {
                const latest = previous ? atlases.find(item => item.id === previous.id) : null;
                const atlas = buildFavoriteAtlas({ name: name.value, slotsText: slotText(), slotIds: liveDrafts().map(slot => slot.id), previous: latest });
                void update(atlas, () => { session.cancel(); activeEditor = null; editor.replaceChildren(); });
            }
            catch (error) {
                failDraft(error);
            }
        });
        save.dataset.atlasSave = 'true';
        const cancel = button(__rmT("dGHleh"), () => { session.cancel(); activeEditor = null; editor.replaceChildren(); add.focus(); });
        cancel.className = 'rm-atlas-tertiary';
        actions.append(save, cancel);
        form.append(heading, nameLabel, generate, generateHint, localStatus, preview, draftSection, hint, bulk, actions);
        editor.append(form);
        paintSlots();
        name.focus();
    }
    function showAssociations(atlas, container, slot) {
        container.replaceChildren();
        const progress = favoriteAtlasProgress(atlas, rows);
        const selectedSlot = progress.slots.find(item => item.id === slot.id);
        const selected = new Set(selectedSlot.matches.map(item => item.id));
        const title = node('strong', `${__rmT("YSk")}${slot.label}${__rmT("Dl8XJnAbfxNhISdv")}`);
        const hint = node('p', __rmT("DR0vt4uHAl6k0ua99GYbkKdbcPoE8ITF1wz..p3acWIQlhO7IUVPMKFFHe1GoNBKJ03.RocEqVfhQehXrYEDUeeG8MTK_ofKPVu3ygZchiyM3cLPoH1FVDV.Lwt9D73jN_SOvT"), 'rm-atlas-hint');
        const search = node('input');
        search.type = 'search';
        search.placeholder = __rmT("2hFCofxfKfrlV0ekIvD");
        search.setAttribute('aria-label', `${__rmT("Hb06f1Vg")}${slot.label}${__rmT("Dl8XJnAbfxNhISdv")}`);
        search.style.cssText = 'width:100%;min-height:44px;font:inherit;';
        const picker = node('div', '', 'rm-atlas-picker');
        function paintChoices() {
            picker.replaceChildren();
            const visible = rows.filter(row => displayTitle(row).toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()));
            if (!visible.length)
                picker.append(node('p', __rmT("xhV2o6aqT0ESMMrX4DD"), 'rm-atlas-hint'));
            for (const row of visible) {
                const line = node('div', '', 'rm-atlas-choice');
                const label = node('label');
                const check = node('input');
                check.type = 'checkbox';
                check.checked = selected.has(row.id);
                check.addEventListener('change', () => { if (check.checked)
                    selected.add(row.id);
                else
                    selected.delete(row.id); });
                label.append(check, node('span', displayTitle(row)));
                line.append(label, button(__rmT("926tnk"), () => open(row.id)));
                picker.append(line);
            }
        }
        search.addEventListener('input', paintChoices);
        paintChoices();
        const actions = node('div', '', 'rm-atlas-actions');
        actions.append(button(__rmT("UDZravjDAcG"), () => { void update(setAtlasSelection(atlas, slot.id, [...selected])); }), button(__rmT("nFMqI9ntws7fMlcU"), () => { void update(setAtlasSelection(atlas, slot.id, null)); }), button(__rmT("oPv5.h"), () => container.replaceChildren()));
        container.append(title, hint, search, picker, actions);
        search.focus();
    }
    function paint(openId = '') {
        const previouslyOpen = new Set([...list.querySelectorAll('details[open]')].map(item => item.dataset.atlasId));
        list.replaceChildren();
        for (const atlas of atlases) {
            const progress = favoriteAtlasProgress(atlas, rows);
            const box = node('details', '', 'rm-atlas-box');
            box.dataset.atlasId = atlas.id;
            box.open = previouslyOpen.has(atlas.id) || openId === atlas.id;
            const summary = node('summary', `${atlas.name} ${progress.count}/${progress.total}`);
            const bar = node('div', '', 'rm-atlas-bar');
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-label', `${atlas.name}${__rmT("bM8BVGALDBf")}`);
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', String(progress.total));
            bar.setAttribute('aria-valuenow', String(progress.count));
            const fill = node('span');
            fill.style.width = `${progress.count / progress.total * 100}%`;
            bar.append(fill);
            const grid = node('div', '', 'rm-atlas-grid');
            const linkGrid = node('div', '', 'rm-atlas-grid rm-atlas-links');
            const associations = node('div');
            for (const slot of progress.slots) {
                const cell = button(slot.label, () => {
                    if (slot.matches.length)
                        open(slot.matches[0].id);
                    else
                        showAssociations(atlas, associations, slot);
                });
                cell.dataset.collected = String(!!slot.matches.length);
                cell.setAttribute('aria-label', slot.matches.length ? `${slot.label}${__rmT("i896azVOXeeBTh")}${slot.matches.length}${__rmT("7aATSss9GfEYAeOoTn_")}` : `${slot.label}${__rmT("DV3sRKRA08f0WZaJOyHLo2Yr9PBgPf")}`);
                cell.title = slot.matches.length ? displayTitle(slot.matches[0]) : __rmT(".PQHw9_AaBmQYZcRwXTb8Aax");
                grid.append(cell);
                linkGrid.append(button(`${slot.label}${slot.manual ? __rmT("UqjXOn_p3J1fCk") : ''}`, () => showAssociations(atlas, associations, slot)));
            }
            const tools = node('div', '', 'rm-atlas-actions');
            const manage = node('details');
            manage.append(node('summary', __rmT("xzf3I7UJW6A29f")), linkGrid);
            const confirm = node('div', '', 'rm-atlas-confirm');
            tools.append(button(__rmT("j67t4M0tsAh"), () => showEditor(atlas)), button(__rmT("NudMV90tsAh"), () => {
                confirm.replaceChildren();
                confirm.append(node('p', `${__rmT("GF0XA0DtSXG")}${atlas.name}${__rmT("Mg.VrZ9_USC5kA.ePziQUekZjUG.8KzDfGdeXbKq")}`, 'rm-atlas-hint'), button(__rmT("f8Bocr8__TIGRuJU"), () => {
                    void persist(() => deleteFavoriteAtlas(atlas.id), () => {
                        atlases = atlases.filter(item => item.id !== atlas.id);
                        editor.replaceChildren();
                        paint();
                        status.textContent = __rmT("3eRmYFVY0N3PRixGMAuF.__cLei_87s2");
                    });
                }), button(__rmT("dGHleh"), () => confirm.replaceChildren()));
            }));
            box.append(summary, bar, grid, node('p', __rmT("DSXNx07pnI1MqzN5YUHgcZPPlkGXC4DSzTkzNp5V4c1JC8.8bxmr7Qojh_IEc82OaqnC6VNMBsA9IroLuKNilmY1SMbJcOiS7Pu04i1vTMV8gDWJOZe498VkWz9n3yV5dW37pPgI3gb9jSmdUxdRA1.hjYm7SXOsLhlx_T"), 'rm-atlas-hint'), manage, associations, tools, confirm);
            list.append(box);
        }
    }
    root.setFavorites = next => { rows = next; paint(); };
    void listFavoriteAtlases().then(items => {
        atlases = items;
        add.disabled = false;
        paint();
        status.textContent = items.length ? '' : __rmT("XjGgAvk3DuAEnDNoh7qD2sKO7xzHeTkghexNW3E2vZwUWueAq8_");
    }).catch(error => {
        fail(error);
        const retry = button(__rmT("8rsJyPjVT_eGRuJU"), () => {
            retry.disabled = true;
            void listFavoriteAtlases().then(items => {
                atlases = items;
                add.disabled = false;
                paint();
                status.textContent = '';
                retry.remove();
            }).catch(error => { fail(error); retry.disabled = false; });
        });
        root.append(retry);
    });
    return root;
}
