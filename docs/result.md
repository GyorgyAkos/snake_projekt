Try 1:
PS E:\tanulas\egyetem\szakdolgozat\snake_projekt\ai_service> python training/train_dqn.py --curriculum     
=== Stage 1: 12x12, 10000 episodes ===
ep 0 reward -9.6 mean100 -9.64 eps 1.000
ep 100 reward -9.6 mean100 -9.57 eps 0.988
ep 200 reward -9.6 mean100 -9.60 eps 0.976
ep 300 reward -9.7 mean100 -9.54 eps 0.964
ep 400 reward -8.6 mean100 -9.49 eps 0.953
ep 500 reward -9.7 mean100 -9.41 eps 0.941
ep 600 reward -9.6 mean100 -9.46 eps 0.929
ep 700 reward -9.7 mean100 -9.35 eps 0.917
ep 800 reward -9.5 mean100 -9.53 eps 0.905
ep 900 reward -9.8 mean100 -9.65 eps 0.893
  -> checkpoint models\dqn_snake.pt
ep 1000 reward -9.6 mean100 -9.68 eps 0.881
ep 1100 reward -9.7 mean100 -9.66 eps 0.869
ep 1200 reward -9.6 mean100 -9.65 eps 0.858
ep 1300 reward -9.5 mean100 -9.50 eps 0.846
ep 1400 reward -9.6 mean100 -9.59 eps 0.834
ep 1500 reward -8.6 mean100 -9.49 eps 0.822
ep 1600 reward -8.5 mean100 -9.47 eps 0.810
ep 1700 reward -9.7 mean100 -9.42 eps 0.798
ep 1800 reward -8.8 mean100 -9.38 eps 0.786
ep 1900 reward -8.8 mean100 -9.49 eps 0.774
  -> checkpoint models\dqn_snake.pt
ep 2000 reward -9.8 mean100 -9.38 eps 0.762
ep 2100 reward -8.8 mean100 -9.42 eps 0.751
ep 2200 reward -8.5 mean100 -9.31 eps 0.739
ep 2300 reward -9.7 mean100 -9.22 eps 0.727
ep 2400 reward -9.8 mean100 -9.44 eps 0.715
ep 2500 reward -9.7 mean100 -9.39 eps 0.703
ep 2600 reward -8.5 mean100 -9.22 eps 0.691
ep 2700 reward -9.7 mean100 -9.27 eps 0.679
ep 2800 reward -9.6 mean100 -9.15 eps 0.667
ep 2900 reward -8.4 mean100 -9.25 eps 0.656
  -> checkpoint models\dqn_snake.pt
ep 3000 reward -9.7 mean100 -9.30 eps 0.644
ep 3100 reward -9.7 mean100 -9.26 eps 0.632
ep 3200 reward -9.7 mean100 -9.12 eps 0.620
ep 3300 reward -9.6 mean100 -9.24 eps 0.608
ep 3400 reward -8.7 mean100 -9.15 eps 0.596
ep 3500 reward -8.7 mean100 -9.16 eps 0.584
ep 3600 reward -9.6 mean100 -9.05 eps 0.573
ep 3700 reward -9.4 mean100 -9.00 eps 0.561
ep 3800 reward -8.7 mean100 -9.05 eps 0.549
ep 3900 reward -8.5 mean100 -8.87 eps 0.537
  -> checkpoint models\dqn_snake.pt
ep 4000 reward -7.6 mean100 -8.80 eps 0.525
ep 4100 reward -9.5 mean100 -8.78 eps 0.513
ep 4200 reward -8.7 mean100 -8.67 eps 0.501
ep 4300 reward -8.8 mean100 -8.48 eps 0.489
ep 4400 reward -9.7 mean100 -8.51 eps 0.478
ep 4500 reward -8.8 mean100 -8.40 eps 0.466
ep 4600 reward -8.7 mean100 -8.51 eps 0.454
ep 4700 reward -8.6 mean100 -8.48 eps 0.442
ep 4800 reward -8.7 mean100 -8.68 eps 0.430
ep 4900 reward -8.7 mean100 -8.70 eps 0.418
  -> checkpoint models\dqn_snake.pt
ep 5000 reward -8.8 mean100 -8.48 eps 0.406
ep 5100 reward -8.8 mean100 -8.36 eps 0.394
ep 5200 reward -8.4 mean100 -8.39 eps 0.383
ep 5300 reward -8.7 mean100 -8.52 eps 0.371
ep 5400 reward -8.7 mean100 -8.57 eps 0.359
ep 5500 reward -8.2 mean100 -8.36 eps 0.347
ep 5600 reward -8.8 mean100 -8.39 eps 0.335
ep 5700 reward -8.0 mean100 -8.45 eps 0.323
ep 5800 reward -8.7 mean100 -8.42 eps 0.311
ep 5900 reward -8.8 mean100 -8.35 eps 0.299
  -> checkpoint models\dqn_snake.pt
ep 6000 reward -9.8 mean100 -8.65 eps 0.288
ep 6100 reward -9.5 mean100 -8.74 eps 0.276
ep 6200 reward -8.0 mean100 -9.09 eps 0.264
ep 6300 reward -8.3 mean100 -9.18 eps 0.252
ep 6400 reward -9.5 mean100 -9.49 eps 0.240
ep 6500 reward -9.7 mean100 -9.54 eps 0.228
ep 6600 reward -9.5 mean100 -9.52 eps 0.216
ep 6700 reward -8.5 mean100 -8.61 eps 0.204
ep 6800 reward -9.5 mean100 -8.89 eps 0.193
ep 6900 reward -9.4 mean100 -8.97 eps 0.181
  -> checkpoint models\dqn_snake.pt
ep 7000 reward -8.8 mean100 -9.03 eps 0.169
ep 7100 reward -9.1 mean100 -8.96 eps 0.157
ep 7200 reward -9.8 mean100 -8.81 eps 0.145
ep 7300 reward -8.2 mean100 -8.96 eps 0.133
ep 7400 reward -9.9 mean100 -8.09 eps 0.121
ep 7500 reward -7.9 mean100 -8.35 eps 0.109
ep 7600 reward -8.6 mean100 -8.88 eps 0.098
ep 7700 reward -8.4 mean100 -8.77 eps 0.086
ep 7800 reward -9.6 mean100 -7.71 eps 0.074
ep 7900 reward -9.8 mean100 -8.69 eps 0.062
  -> checkpoint models\dqn_snake.pt
ep 8000 reward -9.0 mean100 -7.50 eps 0.050
  -> saved models\dqn_snake.pt (best mean100 -7.50)
ep 8100 reward -3.6 mean100 -4.88 eps 0.050
ep 8200 reward -4.9 mean100 -7.62 eps 0.050
ep 8300 reward -9.0 mean100 -8.11 eps 0.050
ep 8400 reward -9.6 mean100 -7.90 eps 0.050
ep 8500 reward -9.2 mean100 -7.35 eps 0.050
ep 8600 reward -9.9 mean100 -7.92 eps 0.050
ep 8700 reward -7.8 mean100 -8.14 eps 0.050
ep 8800 reward -1.2 mean100 -7.18 eps 0.050
ep 8900 reward -8.9 mean100 -7.50 eps 0.050
  -> checkpoint models\dqn_snake.pt
ep 9000 reward -9.8 mean100 -8.41 eps 0.050
ep 9100 reward -0.8 mean100 -8.56 eps 0.050
ep 9200 reward -9.7 mean100 -8.27 eps 0.050
ep 9300 reward -5.0 mean100 -7.72 eps 0.050
ep 9400 reward -9.3 mean100 -8.24 eps 0.050
ep 9500 reward -8.6 mean100 -8.56 eps 0.050
ep 9600 reward -9.0 mean100 -8.55 eps 0.050
ep 9700 reward -9.4 mean100 -8.69 eps 0.050
ep 9800 reward -8.4 mean100 -8.55 eps 0.050
ep 9900 reward -8.5 mean100 -7.94 eps 0.050
ep 9999 reward -6.7 mean100 -5.95 eps 0.050
  -> checkpoint models\dqn_snake.pt
Done. Best mean100 reward: -4.54
=== Stage 2: 20x20, 15000 episodes (loading from stage 1) ===
Loaded model from models\dqn_snake.pt
ep 0 reward -8.7 mean100 -8.68 eps 1.000
ep 100 reward -8.7 mean100 -8.67 eps 0.992
ep 200 reward -8.7 mean100 -8.67 eps 0.984
ep 300 reward -8.6 mean100 -8.67 eps 0.976
ep 400 reward -8.7 mean100 -8.64 eps 0.968
ep 500 reward -8.4 mean100 -8.58 eps 0.960
  -> saved models\dqn_snake.pt (best mean100 -8.58)
ep 600 reward -8.7 mean100 -8.57 eps 0.953
ep 700 reward -8.8 mean100 -8.62 eps 0.945
ep 800 reward -8.8 mean100 -8.68 eps 0.937
ep 900 reward -8.7 mean100 -8.71 eps 0.929
  -> checkpoint models\dqn_snake.pt
ep 1000 reward -8.6 mean100 -8.59 eps 0.921
ep 1100 reward -8.7 mean100 -8.60 eps 0.913
ep 1200 reward -8.6 mean100 -8.64 eps 0.905
ep 1300 reward -8.7 mean100 -8.65 eps 0.897
ep 1400 reward -8.5 mean100 -8.71 eps 0.889
ep 1500 reward -8.7 mean100 -8.64 eps 0.881
ep 1600 reward -8.3 mean100 -8.62 eps 0.873
ep 1700 reward -8.1 mean100 -8.46 eps 0.865
ep 1800 reward -8.4 mean100 -7.97 eps 0.858
ep 1900 reward -7.3 mean100 -7.79 eps 0.850
  -> checkpoint models\dqn_snake.pt
ep 2000 reward -9.5 mean100 -8.57 eps 0.842
ep 2100 reward -8.1 mean100 -8.30 eps 0.834
ep 2200 reward -6.3 mean100 -8.20 eps 0.826
ep 2300 reward -9.4 mean100 -8.02 eps 0.818
ep 2400 reward -6.6 mean100 -7.94 eps 0.810
ep 2500 reward -6.3 mean100 -7.79 eps 0.802
ep 2600 reward -9.4 mean100 -7.88 eps 0.794
ep 2700 reward -5.8 mean100 -7.31 eps 0.786
ep 2800 reward -8.3 mean100 -7.91 eps 0.778
ep 2900 reward -8.9 mean100 -8.12 eps 0.770
  -> checkpoint models\dqn_snake.pt
ep 3000 reward -9.3 mean100 -8.95 eps 0.762
ep 3100 reward -9.0 mean100 -8.99 eps 0.755
ep 3200 reward -8.3 mean100 -8.97 eps 0.747
ep 3300 reward -9.2 mean100 -8.94 eps 0.739
ep 3400 reward -9.3 mean100 -9.04 eps 0.731
ep 3500 reward -9.3 mean100 -9.01 eps 0.723
ep 3600 reward -9.3 mean100 -8.97 eps 0.715
ep 3700 reward -8.8 mean100 -9.05 eps 0.707
ep 3800 reward -9.3 mean100 -9.03 eps 0.699
ep 3900 reward -8.9 mean100 -8.86 eps 0.691
  -> checkpoint models\dqn_snake.pt
ep 4000 reward -9.3 mean100 -8.63 eps 0.683
ep 4100 reward -7.9 mean100 -8.54 eps 0.675
ep 4200 reward -9.5 mean100 -8.57 eps 0.667
ep 4300 reward -8.8 mean100 -8.45 eps 0.660
ep 4400 reward -7.3 mean100 -8.64 eps 0.652
ep 4500 reward -8.1 mean100 -8.57 eps 0.644
ep 4600 reward -9.2 mean100 -8.81 eps 0.636
ep 4700 reward -9.2 mean100 -8.83 eps 0.628
ep 4800 reward -8.7 mean100 -8.95 eps 0.620
ep 4900 reward -9.0 mean100 -8.90 eps 0.612
  -> checkpoint models\dqn_snake.pt
ep 5000 reward -9.2 mean100 -8.83 eps 0.604
ep 5100 reward -8.2 mean100 -8.87 eps 0.596
ep 5200 reward -8.8 mean100 -8.80 eps 0.588
ep 5300 reward -8.4 mean100 -8.57 eps 0.580
ep 5400 reward -7.4 mean100 -8.38 eps 0.573
ep 5500 reward -4.6 mean100 -8.18 eps 0.565
ep 5600 reward -9.0 mean100 -7.98 eps 0.557
ep 5700 reward -4.3 mean100 -8.18 eps 0.549
ep 5800 reward -8.4 mean100 -8.32 eps 0.541
ep 5900 reward -7.8 mean100 -8.52 eps 0.533
  -> checkpoint models\dqn_snake.pt
ep 6000 reward -9.3 mean100 -8.60 eps 0.525
ep 6100 reward -9.3 mean100 -8.68 eps 0.517
ep 6200 reward -9.0 mean100 -8.43 eps 0.509
ep 6300 reward -9.0 mean100 -8.44 eps 0.501
ep 6400 reward -8.3 mean100 -8.51 eps 0.493
ep 6500 reward -8.8 mean100 -8.49 eps 0.485
ep 6600 reward -7.6 mean100 -8.38 eps 0.478
ep 6700 reward -8.2 mean100 -8.35 eps 0.470
ep 6800 reward -9.5 mean100 -8.45 eps 0.462
ep 6900 reward -9.7 mean100 -8.83 eps 0.454
  -> checkpoint models\dqn_snake.pt
ep 7000 reward -8.4 mean100 -8.65 eps 0.446
ep 7100 reward -8.6 mean100 -8.85 eps 0.438
ep 7200 reward -6.8 mean100 -8.92 eps 0.430
ep 7300 reward -8.5 mean100 -8.72 eps 0.422
ep 7400 reward -9.5 mean100 -8.85 eps 0.414
ep 7500 reward -8.1 mean100 -8.52 eps 0.406
ep 7600 reward -8.2 mean100 -8.19 eps 0.398
ep 7700 reward -9.1 mean100 -7.92 eps 0.390
ep 7800 reward -4.7 mean100 -5.35 eps 0.383
ep 7900 reward -7.5 mean100 -5.81 eps 0.375
  -> checkpoint models\dqn_snake.pt
ep 8000 reward -8.5 mean100 -7.04 eps 0.367
ep 8100 reward -9.8 mean100 -8.05 eps 0.359
ep 8200 reward -8.7 mean100 -8.33 eps 0.351
ep 8300 reward -7.2 mean100 -8.43 eps 0.343
ep 8400 reward -8.0 mean100 -8.41 eps 0.335
ep 8500 reward -7.5 mean100 -8.47 eps 0.327
ep 8600 reward -8.8 mean100 -8.66 eps 0.319
ep 8700 reward -9.4 mean100 -8.58 eps 0.311
ep 8800 reward -9.8 mean100 -8.17 eps 0.303
ep 8900 reward -9.8 mean100 -7.80 eps 0.295
  -> checkpoint models\dqn_snake.pt
ep 9000 reward -7.4 mean100 -7.81 eps 0.288
ep 9100 reward 2.4 mean100 -6.71 eps 0.280
ep 9200 reward -3.6 mean100 -7.25 eps 0.272
ep 9300 reward -8.5 mean100 -7.72 eps 0.264
ep 9400 reward -5.2 mean100 -7.48 eps 0.256
ep 9500 reward -7.3 mean100 -7.84 eps 0.248
ep 9600 reward -9.3 mean100 -6.93 eps 0.240
ep 9700 reward -1.0 mean100 -5.53 eps 0.232
ep 9800 reward -8.3 mean100 -3.54 eps 0.224
ep 9900 reward -3.5 mean100 -0.51 eps 0.216
  -> checkpoint models\dqn_snake.pt
ep 10000 reward -3.9 mean100 -0.89 eps 0.208
ep 10100 reward 19.4 mean100 3.73 eps 0.200
ep 10200 reward 4.2 mean100 10.55 eps 0.193
ep 10300 reward 24.5 mean100 1.74 eps 0.185
ep 10400 reward -6.6 mean100 6.73 eps 0.177
ep 10500 reward -2.4 mean100 5.75 eps 0.169
ep 10600 reward -8.7 mean100 6.77 eps 0.161
ep 10700 reward 0.9 mean100 -3.48 eps 0.153
ep 10800 reward -6.9 mean100 -5.12 eps 0.145
ep 10900 reward 36.0 mean100 3.76 eps 0.137
  -> checkpoint models\dqn_snake.pt
ep 11000 reward 117.7 mean100 21.07 eps 0.129
  -> saved models\dqn_snake.pt (best mean100 21.07)

Try 2:
PS E:\tanulas\egyetem\szakdolgozat\snake_projekt\ai_service> python training/train_dqn.py --curriculum     
=== Stage 1: 12x12, 10000 episodes ===
ep 0 reward -9.6 mean100 -9.64 eps 1.000
ep 100 reward -9.6 mean100 -9.61 eps 0.988
ep 200 reward -9.6 mean100 -9.48 eps 0.976
ep 300 reward -9.6 mean100 -9.46 eps 0.964
ep 400 reward -9.6 mean100 -9.47 eps 0.953
ep 500 reward -9.5 mean100 -9.58 eps 0.941
ep 600 reward -9.6 mean100 -9.55 eps 0.929
ep 700 reward -9.7 mean100 -9.52 eps 0.917
ep 800 reward -9.6 mean100 -9.54 eps 0.905
ep 900 reward -9.6 mean100 -9.50 eps 0.893
  -> checkpoint models\dqn_snake.pt
ep 1000 reward -9.6 mean100 -9.54 eps 0.881
ep 1100 reward -9.6 mean100 -9.58 eps 0.869
ep 1200 reward -9.6 mean100 -9.57 eps 0.858
ep 1300 reward -9.7 mean100 -9.62 eps 0.846
ep 1400 reward -9.6 mean100 -9.52 eps 0.834
ep 1500 reward -9.6 mean100 -9.50 eps 0.822
ep 1600 reward -8.6 mean100 -9.38 eps 0.810
ep 1700 reward -9.6 mean100 -9.21 eps 0.798
ep 1800 reward -8.8 mean100 -9.07 eps 0.786
ep 1900 reward -8.8 mean100 -8.95 eps 0.774
  -> checkpoint models\dqn_snake.pt
ep 2000 reward -8.3 mean100 -9.00 eps 0.762
ep 2100 reward -7.2 mean100 -8.92 eps 0.751
ep 2200 reward -8.5 mean100 -8.84 eps 0.739
ep 2300 reward -8.8 mean100 -8.81 eps 0.727
ep 2400 reward -9.6 mean100 -8.60 eps 0.715
ep 2500 reward -9.5 mean100 -8.75 eps 0.703
ep 2600 reward -9.8 mean100 -9.46 eps 0.691
ep 2700 reward -9.3 mean100 -9.39 eps 0.679
ep 2800 reward -9.8 mean100 -9.41 eps 0.667
ep 2900 reward -9.5 mean100 -9.46 eps 0.656
  -> checkpoint models\dqn_snake.pt
ep 3000 reward -9.5 mean100 -9.22 eps 0.644
ep 3100 reward -8.9 mean100 -8.70 eps 0.632
ep 3200 reward -8.8 mean100 -8.54 eps 0.620
ep 3300 reward -9.5 mean100 -8.93 eps 0.608
ep 3400 reward -9.5 mean100 -9.47 eps 0.596
ep 3500 reward -9.5 mean100 -9.27 eps 0.584
ep 3600 reward -8.0 mean100 -8.62 eps 0.573
ep 3700 reward -8.6 mean100 -8.54 eps 0.561
ep 3800 reward -8.6 mean100 -8.72 eps 0.549
ep 3900 reward -8.4 mean100 -8.97 eps 0.537
  -> checkpoint models\dqn_snake.pt
ep 4000 reward -9.1 mean100 -9.18 eps 0.525
ep 4100 reward -8.6 mean100 -8.79 eps 0.513
ep 4200 reward -9.3 mean100 -8.96 eps 0.501
ep 4300 reward -9.8 mean100 -9.20 eps 0.489
ep 4400 reward -8.7 mean100 -9.09 eps 0.478
ep 4500 reward -9.1 mean100 -9.17 eps 0.466
ep 4600 reward -6.5 mean100 -8.86 eps 0.454
ep 4700 reward -8.0 mean100 -8.70 eps 0.442
ep 4800 reward -6.8 mean100 -8.84 eps 0.430
ep 4900 reward -6.7 mean100 -8.53 eps 0.418
  -> checkpoint models\dqn_snake.pt
ep 5000 reward -8.4 mean100 -8.93 eps 0.406
ep 5100 reward -8.3 mean100 -8.56 eps 0.394
ep 5200 reward -6.7 mean100 -8.40 eps 0.383
ep 5300 reward -9.3 mean100 -8.67 eps 0.371
ep 5400 reward -9.1 mean100 -8.11 eps 0.359
ep 5500 reward -9.7 mean100 -8.10 eps 0.347
ep 5600 reward -7.8 mean100 -8.46 eps 0.335
ep 5700 reward -9.1 mean100 -8.30 eps 0.323
ep 5800 reward -9.6 mean100 -8.74 eps 0.311
ep 5900 reward -8.2 mean100 -8.90 eps 0.299
  -> checkpoint models\dqn_snake.pt
ep 6000 reward -8.7 mean100 -8.17 eps 0.288
ep 6100 reward -8.3 mean100 -7.26 eps 0.276
ep 6200 reward -8.0 mean100 -7.92 eps 0.264
ep 6300 reward -7.3 mean100 -7.77 eps 0.252
ep 6400 reward -8.4 mean100 -7.56 eps 0.240
ep 6500 reward -4.7 mean100 -8.11 eps 0.228
ep 6600 reward -9.2 mean100 -8.55 eps 0.216
ep 6700 reward -8.2 mean100 -8.36 eps 0.204
ep 6800 reward -0.9 mean100 -8.01 eps 0.193
ep 6900 reward -9.3 mean100 -7.85 eps 0.181
  -> checkpoint models\dqn_snake.pt
ep 7000 reward -8.1 mean100 -7.79 eps 0.169
ep 7100 reward -4.6 mean100 -6.97 eps 0.157
ep 7200 reward -4.5 mean100 -7.05 eps 0.145
ep 7300 reward -3.8 mean100 -6.60 eps 0.133
ep 7400 reward -8.7 mean100 -5.11 eps 0.121
ep 7500 reward -9.7 mean100 -7.99 eps 0.109
ep 7600 reward -8.3 mean100 -7.89 eps 0.098
ep 7700 reward -9.1 mean100 -7.96 eps 0.086
ep 7800 reward -8.7 mean100 -8.74 eps 0.074
ep 7900 reward -7.5 mean100 -7.77 eps 0.062
  -> checkpoint models\dqn_snake.pt
ep 8000 reward -8.4 mean100 -7.96 eps 0.050
ep 8100 reward -8.9 mean100 -7.84 eps 0.050
ep 8200 reward -9.2 mean100 -7.96 eps 0.050
ep 8300 reward -9.5 mean100 -8.00 eps 0.050
ep 8400 reward -9.4 mean100 -8.02 eps 0.050
ep 8500 reward -9.2 mean100 -8.48 eps 0.050
ep 8600 reward -8.8 mean100 -8.46 eps 0.050
ep 8700 reward -3.6 mean100 -8.43 eps 0.050
ep 8800 reward -8.0 mean100 -8.37 eps 0.050
ep 8900 reward -9.8 mean100 -8.08 eps 0.050
  -> checkpoint models\dqn_snake.pt
ep 9000 reward -9.5 mean100 -8.49 eps 0.050
ep 9100 reward -8.7 mean100 -8.64 eps 0.050
ep 9200 reward -9.4 mean100 -8.19 eps 0.050
ep 9300 reward -9.1 mean100 -7.97 eps 0.050
ep 9400 reward -8.9 mean100 -8.28 eps 0.050
ep 9500 reward -8.5 mean100 -8.23 eps 0.050
ep 9600 reward -7.8 mean100 -8.47 eps 0.050
ep 9700 reward -8.9 mean100 -8.35 eps 0.050
ep 9800 reward -9.1 mean100 -6.37 eps 0.050
ep 9900 reward -5.3 mean100 -7.18 eps 0.050
ep 9999 reward -7.0 mean100 -7.36 eps 0.050
  -> checkpoint models\dqn_snake.pt
Done. Best mean100 reward: -4.53
=== Stage 2: 20x20, 15000 episodes (loading from stage 1) ===
Loaded model from models\dqn_snake.pt
ep 0 reward -8.7 mean100 -8.68 eps 1.000
ep 100 reward -8.7 mean100 -8.67 eps 0.992
ep 200 reward -8.7 mean100 -8.67 eps 0.984
ep 300 reward -8.7 mean100 -8.67 eps 0.976
ep 400 reward -8.7 mean100 -8.66 eps 0.968
ep 500 reward -8.6 mean100 -8.67 eps 0.960
ep 600 reward -8.8 mean100 -8.68 eps 0.953
ep 700 reward -8.3 mean100 -8.55 eps 0.945
ep 800 reward -8.3 mean100 -8.41 eps 0.937
ep 900 reward -8.6 mean100 -8.41 eps 0.929
  -> checkpoint models\dqn_snake.pt
ep 1000 reward -8.6 mean100 -8.44 eps 0.921
ep 1100 reward -8.9 mean100 -8.31 eps 0.913
ep 1200 reward -8.3 mean100 -8.23 eps 0.905
ep 1300 reward -8.8 mean100 -8.24 eps 0.897
ep 1400 reward -8.9 mean100 -8.31 eps 0.889
ep 1500 reward -8.9 mean100 -8.39 eps 0.881
ep 1600 reward -8.8 mean100 -8.58 eps 0.873
ep 1700 reward -9.3 mean100 -8.59 eps 0.865
ep 1800 reward -9.0 mean100 -8.61 eps 0.858
ep 1900 reward -9.7 mean100 -8.12 eps 0.850
  -> checkpoint models\dqn_snake.pt
ep 2000 reward -8.2 mean100 -8.40 eps 0.842
ep 2100 reward -8.6 mean100 -8.74 eps 0.834
ep 2200 reward -8.9 mean100 -8.80 eps 0.826
ep 2300 reward -5.9 mean100 -8.69 eps 0.818
ep 2400 reward -8.8 mean100 -8.53 eps 0.810
ep 2500 reward -8.9 mean100 -8.42 eps 0.802
ep 2600 reward -8.9 mean100 -8.37 eps 0.794
ep 2700 reward -8.4 mean100 -8.38 eps 0.786
ep 2800 reward -9.6 mean100 -8.54 eps 0.778
ep 2900 reward -9.5 mean100 -8.84 eps 0.770
  -> checkpoint models\dqn_snake.pt
ep 3000 reward -9.4 mean100 -8.82 eps 0.762
ep 3100 reward -9.5 mean100 -8.92 eps 0.755
ep 3200 reward -9.4 mean100 -8.96 eps 0.747
ep 3300 reward -8.6 mean100 -9.00 eps 0.739
ep 3400 reward -8.6 mean100 -8.96 eps 0.731
ep 3500 reward -8.7 mean100 -9.01 eps 0.723
ep 3600 reward -8.5 mean100 -8.95 eps 0.715
ep 3700 reward -7.5 mean100 -8.93 eps 0.707
ep 3800 reward -8.6 mean100 -8.89 eps 0.699
ep 3900 reward -9.5 mean100 -9.06 eps 0.691
  -> checkpoint models\dqn_snake.pt
ep 4000 reward -8.4 mean100 -8.90 eps 0.683
ep 4100 reward -8.9 mean100 -8.96 eps 0.675
ep 4200 reward -9.5 mean100 -9.10 eps 0.667
ep 4300 reward -9.2 mean100 -9.05 eps 0.660
ep 4400 reward -8.7 mean100 -9.05 eps 0.652
ep 4500 reward -9.6 mean100 -9.25 eps 0.644
ep 4600 reward -9.3 mean100 -9.07 eps 0.636
ep 4700 reward -8.4 mean100 -9.14 eps 0.628
ep 4800 reward -9.5 mean100 -9.24 eps 0.620
ep 4900 reward -9.6 mean100 -9.16 eps 0.612
  -> checkpoint models\dqn_snake.pt
ep 5000 reward -9.5 mean100 -9.29 eps 0.604
ep 5100 reward -9.4 mean100 -9.31 eps 0.596
ep 5200 reward -9.4 mean100 -9.31 eps 0.588
ep 5300 reward -9.5 mean100 -9.29 eps 0.580
ep 5400 reward -9.5 mean100 -9.23 eps 0.573
ep 5500 reward -9.5 mean100 -9.24 eps 0.565
ep 5600 reward -8.5 mean100 -9.18 eps 0.557
ep 5700 reward -9.5 mean100 -9.18 eps 0.549
ep 5800 reward -8.9 mean100 -9.25 eps 0.541
ep 5900 reward -9.5 mean100 -9.32 eps 0.533
  -> checkpoint models\dqn_snake.pt
ep 6000 reward -9.5 mean100 -9.33 eps 0.525
ep 6100 reward -9.5 mean100 -9.34 eps 0.517
ep 6200 reward -9.5 mean100 -9.39 eps 0.509
ep 6300 reward -9.3 mean100 -9.39 eps 0.501
ep 6400 reward -9.5 mean100 -9.38 eps 0.493
ep 6500 reward -9.4 mean100 -9.41 eps 0.485
ep 6600 reward -9.3 mean100 -9.32 eps 0.478
ep 6700 reward -9.7 mean100 -9.33 eps 0.470
ep 6800 reward -9.1 mean100 -9.37 eps 0.462
ep 6900 reward -9.6 mean100 -9.39 eps 0.454
  -> checkpoint models\dqn_snake.pt
ep 7000 reward -9.6 mean100 -9.39 eps 0.446
ep 7100 reward -9.7 mean100 -9.40 eps 0.438
ep 7200 reward -9.3 mean100 -9.42 eps 0.430
ep 7300 reward -9.6 mean100 -9.43 eps 0.422
ep 7400 reward -8.9 mean100 -9.45 eps 0.414
ep 7500 reward -9.3 mean100 -9.48 eps 0.406
ep 7600 reward -9.5 mean100 -9.45 eps 0.398
ep 7700 reward -9.5 mean100 -9.48 eps 0.390
ep 7800 reward -9.5 mean100 -9.50 eps 0.383
ep 7900 reward -8.2 mean100 -9.49 eps 0.375
  -> checkpoint models\dqn_snake.pt
ep 8000 reward -9.7 mean100 -9.51 eps 0.367
ep 8100 reward -9.5 mean100 -9.51 eps 0.359
ep 8200 reward -9.7 mean100 -9.50 eps 0.351
ep 8300 reward -9.2 mean100 -9.50 eps 0.343
ep 8400 reward -9.6 mean100 -9.51 eps 0.335
ep 8500 reward -9.7 mean100 -9.51 eps 0.327
ep 8600 reward -9.5 mean100 -9.53 eps 0.319
ep 8700 reward -9.6 mean100 -9.44 eps 0.311
ep 8800 reward -9.5 mean100 -9.40 eps 0.303
ep 8900 reward -9.2 mean100 -9.48 eps 0.295
  -> checkpoint models\dqn_snake.pt
ep 9000 reward -9.6 mean100 -9.42 eps 0.288
ep 9100 reward -9.6 mean100 -9.16 eps 0.280
ep 9200 reward -9.2 mean100 -9.32 eps 0.272
ep 9300 reward -9.4 mean100 -9.37 eps 0.264
ep 9400 reward -9.3 mean100 -9.19 eps 0.256
ep 9500 reward -9.6 mean100 -9.38 eps 0.248
ep 9600 reward -9.5 mean100 -9.15 eps 0.240
ep 9700 reward -9.5 mean100 -9.25 eps 0.232
ep 9800 reward -9.3 mean100 -9.31 eps 0.224
ep 9900 reward -9.4 mean100 -9.32 eps 0.216
  -> checkpoint models\dqn_snake.pt
ep 10000 reward -9.2 mean100 -9.10 eps 0.208
ep 10100 reward -9.0 mean100 -8.95 eps 0.200
ep 10200 reward -9.4 mean100 -8.84 eps 0.193
ep 10300 reward -7.9 mean100 -8.87 eps 0.185
ep 10400 reward -6.6 mean100 -9.05 eps 0.177
ep 10500 reward -9.6 mean100 -8.49 eps 0.169
ep 10600 reward -9.3 mean100 -8.82 eps 0.161
ep 10700 reward -9.1 mean100 -8.73 eps 0.153
ep 10800 reward -8.5 mean100 -8.64 eps 0.145
ep 10900 reward -0.3 mean100 -6.90 eps 0.137
  -> checkpoint models\dqn_snake.pt
ep 11000 reward -6.9 mean100 -4.54 eps 0.129
ep 11100 reward -8.2 mean100 -7.53 eps 0.121
ep 11200 reward -9.4 mean100 -8.62 eps 0.113
ep 11300 reward -8.1 mean100 -8.31 eps 0.105
ep 11400 reward -9.2 mean100 -8.45 eps 0.098
ep 11500 reward -9.7 mean100 -7.71 eps 0.090
ep 11600 reward -8.5 mean100 -7.40 eps 0.082
ep 11700 reward -2.4 mean100 -6.68 eps 0.074
ep 11800 reward -6.1 mean100 -6.82 eps 0.066
ep 11900 reward -5.9 mean100 -6.10 eps 0.058
  -> checkpoint models\dqn_snake.pt
ep 12000 reward -8.9 mean100 -5.83 eps 0.050
ep 12100 reward -2.3 mean100 -4.98 eps 0.050
ep 12200 reward 3.5 mean100 -5.31 eps 0.050
ep 12300 reward -1.4 mean100 -4.89 eps 0.050
ep 12400 reward -8.5 mean100 -4.93 eps 0.050
ep 12500 reward -7.0 mean100 -5.67 eps 0.050
ep 12600 reward -7.7 mean100 -5.57 eps 0.050
ep 12700 reward -9.1 mean100 -4.08 eps 0.050
ep 12800 reward 0.0 mean100 -4.27 eps 0.050
ep 12900 reward 1.3 mean100 -3.72 eps 0.050
  -> checkpoint models\dqn_snake.pt
ep 13000 reward -7.8 mean100 -3.76 eps 0.050
ep 13100 reward -6.7 mean100 -2.88 eps 0.050
ep 13200 reward -6.2 mean100 11.68 eps 0.050
ep 13300 reward -9.4 mean100 -9.01 eps 0.050
ep 13400 reward -9.8 mean100 -7.71 eps 0.050
ep 13500 reward -5.2 mean100 -6.57 eps 0.050
ep 13600 reward -8.4 mean100 -4.25 eps 0.050
ep 13700 reward -9.4 mean100 -8.53 eps 0.050
ep 13800 reward -6.5 mean100 -8.70 eps 0.050
ep 13900 reward -7.8 mean100 3.01 eps 0.050
  -> checkpoint models\dqn_snake.pt
ep 14000 reward -0.6 mean100 23.55 eps 0.050
  -> saved models\dqn_snake.pt (best mean100 23.55)
ep 14100 reward -9.2 mean100 16.12 eps 0.050
ep 14200 reward -9.7 mean100 0.64 eps 0.050
ep 14300 reward -8.6 mean100 -7.80 eps 0.050
ep 14400 reward -6.8 mean100 -7.78 eps 0.050
ep 14500 reward -9.7 mean100 -4.60 eps 0.050
ep 14600 reward -7.1 mean100 1.23 eps 0.050
ep 14700 reward 23.8 mean100 5.33 eps 0.050
ep 14800 reward -1.1 mean100 18.87 eps 0.050
ep 14900 reward -8.3 mean100 -0.83 eps 0.050
ep 14999 reward -3.2 mean100 1.36 eps 0.050
  -> checkpoint models\dqn_snake.pt
Done. Best mean100 reward: 47.95
PS E:\tanulas\egyetem\szakdolgozat\snake_projekt\ai_service> 

Try 3:
PS E:\tanulas\egyetem\szakdolgozat\snake_projekt\ai_service> python training/train_dqn.py --curriculum --eval-episodes 50
Backed up existing models to: models\backups\20260227_113210
=== Stage 1: 12x12, 10000 episodes ===
ep 0 reward -9.6 mean100 -9.64 eps 1.000
  -> saved models\dqn_snake_best.pt (best mean100 -9.64)
  -> saved models\dqn_snake_best.pt (best mean100 -9.64)
  -> saved models\dqn_snake_best.pt (best mean100 -9.64)
  -> saved models\dqn_snake_best.pt (best mean100 -9.63)
  -> saved models\dqn_snake_best.pt (best mean100 -9.61)
  -> saved models\dqn_snake_best.pt (best mean100 -9.61)
  -> saved models\dqn_snake_best.pt (best mean100 -9.60)
ep 100 reward -7.5 mean100 -9.58 eps 0.988
  -> saved models\dqn_snake_best.pt (best mean100 -9.58)
  -> saved models\dqn_snake_best.pt (best mean100 -9.57)
  -> saved models\dqn_snake_best.pt (best mean100 -9.57)
  -> saved models\dqn_snake_best.pt (best mean100 -9.56)
  -> saved models\dqn_snake_best.pt (best mean100 -9.56)
  -> saved models\dqn_snake_best.pt (best mean100 -9.55)
  -> saved models\dqn_snake_best.pt (best mean100 -9.55)
  -> saved models\dqn_snake_best.pt (best mean100 -9.55)
  -> saved models\dqn_snake_best.pt (best mean100 -9.53)
  -> saved models\dqn_snake_best.pt (best mean100 -9.52)
  -> saved models\dqn_snake_best.pt (best mean100 -9.52)
  -> saved models\dqn_snake_best.pt (best mean100 -9.50)
  -> saved models\dqn_snake_best.pt (best mean100 -9.48)
  -> saved models\dqn_snake_best.pt (best mean100 -9.48)
  -> saved models\dqn_snake_best.pt (best mean100 -9.46)
  -> saved models\dqn_snake_best.pt (best mean100 -9.44)
  -> saved models\dqn_snake_best.pt (best mean100 -9.44)
  -> saved models\dqn_snake_best.pt (best mean100 -9.44)
  -> saved models\dqn_snake_best.pt (best mean100 -9.43)
  -> saved models\dqn_snake_best.pt (best mean100 -9.42)
  -> saved models\dqn_snake_best.pt (best mean100 -9.42)
  -> saved models\dqn_snake_best.pt (best mean100 -9.42)
  -> saved models\dqn_snake_best.pt (best mean100 -9.42)
  -> saved models\dqn_snake_best.pt (best mean100 -9.41)
  -> saved models\dqn_snake_best.pt (best mean100 -9.41)
  -> saved models\dqn_snake_best.pt (best mean100 -9.40)
  -> saved models\dqn_snake_best.pt (best mean100 -9.40)
  -> saved models\dqn_snake_best.pt (best mean100 -9.39)
  -> saved models\dqn_snake_best.pt (best mean100 -9.37)
  -> saved models\dqn_snake_best.pt (best mean100 -9.37)
  -> saved models\dqn_snake_best.pt (best mean100 -9.37)
  -> saved models\dqn_snake_best.pt (best mean100 -9.37)
  -> saved models\dqn_snake_best.pt (best mean100 -9.36)
ep 200 reward -9.6 mean100 -9.38 eps 0.976
  -> saved models\dqn_snake_best.pt (best mean100 -9.36)
  -> saved models\dqn_snake_best.pt (best mean100 -9.36)
  -> saved models\dqn_snake_best.pt (best mean100 -9.35)
ep 300 reward -8.7 mean100 -9.37 eps 0.964
  -> saved models\dqn_snake_best.pt (best mean100 -9.34)
  -> saved models\dqn_snake_best.pt (best mean100 -9.33)
  -> saved models\dqn_snake_best.pt (best mean100 -9.33)
  -> saved models\dqn_snake_best.pt (best mean100 -9.33)
  -> saved models\dqn_snake_best.pt (best mean100 -9.32)
  -> saved models\dqn_snake_best.pt (best mean100 -9.31)
  -> saved models\dqn_snake_best.pt (best mean100 -9.30)
ep 400 reward -9.7 mean100 -9.40 eps 0.953
ep 500 reward -9.5 mean100 -9.37 eps 0.941
  -> saved models\dqn_snake_best.pt (best mean100 -9.30)
  -> saved models\dqn_snake_best.pt (best mean100 -9.29)
  -> saved models\dqn_snake_best.pt (best mean100 -9.28)
  -> saved models\dqn_snake_best.pt (best mean100 -9.27)
  -> saved models\dqn_snake_best.pt (best mean100 -9.27)
  -> saved models\dqn_snake_best.pt (best mean100 -9.26)
  -> saved models\dqn_snake_best.pt (best mean100 -9.25)
  -> saved models\dqn_snake_best.pt (best mean100 -9.25)
  -> saved models\dqn_snake_best.pt (best mean100 -9.25)
  -> saved models\dqn_snake_best.pt (best mean100 -9.25)
ep 600 reward -9.7 mean100 -9.26 eps 0.929
  -> saved models\dqn_snake_best.pt (best mean100 -9.25)
  -> saved models\dqn_snake_best.pt (best mean100 -9.22)
  -> saved models\dqn_snake_best.pt (best mean100 -9.22)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
  -> saved models\dqn_snake_best.pt (best mean100 -9.21)
ep 700 reward -8.5 mean100 -9.19 eps 0.917
  -> saved models\dqn_snake_best.pt (best mean100 -9.19)
  -> saved models\dqn_snake_best.pt (best mean100 -9.19)
  -> saved models\dqn_snake_best.pt (best mean100 -9.18)
  -> saved models\dqn_snake_best.pt (best mean100 -9.17)
  -> saved models\dqn_snake_best.pt (best mean100 -9.16)
  -> saved models\dqn_snake_best.pt (best mean100 -9.15)
  -> saved models\dqn_snake_best.pt (best mean100 -9.14)
  -> saved models\dqn_snake_best.pt (best mean100 -9.14)
  -> saved models\dqn_snake_best.pt (best mean100 -9.13)
  -> saved models\dqn_snake_best.pt (best mean100 -9.13)
  -> saved models\dqn_snake_best.pt (best mean100 -9.12)
  -> saved models\dqn_snake_best.pt (best mean100 -9.12)
  -> saved models\dqn_snake_best.pt (best mean100 -9.11)
ep 800 reward -9.4 mean100 -9.22 eps 0.905
ep 900 reward -8.6 mean100 -9.36 eps 0.893
  -> checkpoint models\dqn_snake_last.pt
ep 1000 reward -9.6 mean100 -9.35 eps 0.881
ep 1100 reward -9.6 mean100 -9.39 eps 0.869
ep 1200 reward -9.6 mean100 -9.36 eps 0.858
ep 1300 reward -9.7 mean100 -9.47 eps 0.846
ep 1400 reward -8.6 mean100 -9.27 eps 0.834
ep 1500 reward -9.7 mean100 -9.23 eps 0.822
ep 1600 reward -9.6 mean100 -9.19 eps 0.810
  -> saved models\dqn_snake_best.pt (best mean100 -9.11)
  -> saved models\dqn_snake_best.pt (best mean100 -9.10)
  -> saved models\dqn_snake_best.pt (best mean100 -9.09)
  -> saved models\dqn_snake_best.pt (best mean100 -9.08)
ep 1700 reward -9.6 mean100 -9.12 eps 0.798
ep 1800 reward -8.8 mean100 -9.09 eps 0.786
  -> saved models\dqn_snake_best.pt (best mean100 -9.08)
  -> saved models\dqn_snake_best.pt (best mean100 -9.08)
  -> saved models\dqn_snake_best.pt (best mean100 -9.07)
  -> saved models\dqn_snake_best.pt (best mean100 -9.06)
  -> saved models\dqn_snake_best.pt (best mean100 -9.05)
  -> saved models\dqn_snake_best.pt (best mean100 -9.05)
  -> saved models\dqn_snake_best.pt (best mean100 -9.02)
  -> saved models\dqn_snake_best.pt (best mean100 -9.02)
  -> saved models\dqn_snake_best.pt (best mean100 -9.01)
  -> saved models\dqn_snake_best.pt (best mean100 -9.00)
  -> saved models\dqn_snake_best.pt (best mean100 -9.00)
  -> saved models\dqn_snake_best.pt (best mean100 -8.99)
  -> saved models\dqn_snake_best.pt (best mean100 -8.99)
  -> saved models\dqn_snake_best.pt (best mean100 -8.98)
  -> saved models\dqn_snake_best.pt (best mean100 -8.98)
  -> saved models\dqn_snake_best.pt (best mean100 -8.97)
  -> saved models\dqn_snake_best.pt (best mean100 -8.96)
  -> saved models\dqn_snake_best.pt (best mean100 -8.96)
  -> saved models\dqn_snake_best.pt (best mean100 -8.95)
  -> saved models\dqn_snake_best.pt (best mean100 -8.94)
  -> saved models\dqn_snake_best.pt (best mean100 -8.93)
  -> saved models\dqn_snake_best.pt (best mean100 -8.92)
  -> saved models\dqn_snake_best.pt (best mean100 -8.92)
  -> saved models\dqn_snake_best.pt (best mean100 -8.92)
ep 1900 reward -8.6 mean100 -8.95 eps 0.774
  -> saved models\dqn_snake_best.pt (best mean100 -8.91)
  -> saved models\dqn_snake_best.pt (best mean100 -8.91)
  -> saved models\dqn_snake_best.pt (best mean100 -8.90)
  -> saved models\dqn_snake_best.pt (best mean100 -8.90)
  -> checkpoint models\dqn_snake_last.pt
ep 2000 reward -8.7 mean100 -9.06 eps 0.762
ep 2100 reward -7.2 mean100 -8.93 eps 0.751
ep 2200 reward -8.5 mean100 -8.99 eps 0.739
ep 2300 reward -9.7 mean100 -9.01 eps 0.727
ep 2400 reward -8.3 mean100 -9.02 eps 0.715
ep 2500 reward -8.5 mean100 -9.03 eps 0.703
  -> saved models\dqn_snake_best.pt (best mean100 -8.89)
  -> saved models\dqn_snake_best.pt (best mean100 -8.88)
  -> saved models\dqn_snake_best.pt (best mean100 -8.87)
  -> saved models\dqn_snake_best.pt (best mean100 -8.87)
  -> saved models\dqn_snake_best.pt (best mean100 -8.86)
  -> saved models\dqn_snake_best.pt (best mean100 -8.84)
  -> saved models\dqn_snake_best.pt (best mean100 -8.84)
  -> saved models\dqn_snake_best.pt (best mean100 -8.83)
  -> saved models\dqn_snake_best.pt (best mean100 -8.83)
  -> saved models\dqn_snake_best.pt (best mean100 -8.80)
  -> saved models\dqn_snake_best.pt (best mean100 -8.79)
  -> saved models\dqn_snake_best.pt (best mean100 -8.79)
  -> saved models\dqn_snake_best.pt (best mean100 -8.77)
  -> saved models\dqn_snake_best.pt (best mean100 -8.76)
  -> saved models\dqn_snake_best.pt (best mean100 -8.76)
  -> saved models\dqn_snake_best.pt (best mean100 -8.76)
  -> saved models\dqn_snake_best.pt (best mean100 -8.75)
  -> saved models\dqn_snake_best.pt (best mean100 -8.72)
  -> saved models\dqn_snake_best.pt (best mean100 -8.71)
  -> saved models\dqn_snake_best.pt (best mean100 -8.70)
ep 2600 reward -7.8 mean100 -8.70 eps 0.691
  -> saved models\dqn_snake_best.pt (best mean100 -8.70)
  -> saved models\dqn_snake_best.pt (best mean100 -8.69)
  -> saved models\dqn_snake_best.pt (best mean100 -8.69)
  -> saved models\dqn_snake_best.pt (best mean100 -8.68)
  -> saved models\dqn_snake_best.pt (best mean100 -8.67)
  -> saved models\dqn_snake_best.pt (best mean100 -8.67)
  -> saved models\dqn_snake_best.pt (best mean100 -8.67)
  -> saved models\dqn_snake_best.pt (best mean100 -8.66)
  -> saved models\dqn_snake_best.pt (best mean100 -8.66)
  -> saved models\dqn_snake_best.pt (best mean100 -8.66)
  -> saved models\dqn_snake_best.pt (best mean100 -8.65)
  -> saved models\dqn_snake_best.pt (best mean100 -8.65)
  -> saved models\dqn_snake_best.pt (best mean100 -8.62)
  -> saved models\dqn_snake_best.pt (best mean100 -8.62)
  -> saved models\dqn_snake_best.pt (best mean100 -8.62)
  -> saved models\dqn_snake_best.pt (best mean100 -8.61)
  -> saved models\dqn_snake_best.pt (best mean100 -8.61)
ep 2700 reward -9.4 mean100 -8.72 eps 0.679
ep 2800 reward -9.6 mean100 -8.73 eps 0.667
ep 2900 reward -8.5 mean100 -9.34 eps 0.656
  -> checkpoint models\dqn_snake_last.pt
ep 3000 reward -9.8 mean100 -9.30 eps 0.644
ep 3100 reward -9.6 mean100 -9.39 eps 0.632
ep 3200 reward -9.8 mean100 -9.39 eps 0.620
ep 3300 reward -9.3 mean100 -9.25 eps 0.608
ep 3400 reward -7.0 mean100 -8.89 eps 0.596
ep 3500 reward -9.5 mean100 -8.73 eps 0.584
  -> saved models\dqn_snake_best.pt (best mean100 -8.60)
  -> saved models\dqn_snake_best.pt (best mean100 -8.60)
  -> saved models\dqn_snake_best.pt (best mean100 -8.58)
ep 3600 reward -9.5 mean100 -8.79 eps 0.573
ep 3700 reward -4.8 mean100 -8.79 eps 0.561
ep 3800 reward -9.8 mean100 -9.02 eps 0.549
ep 3900 reward -9.8 mean100 -9.03 eps 0.537
  -> checkpoint models\dqn_snake_last.pt
ep 4000 reward -9.4 mean100 -9.37 eps 0.525
ep 4100 reward -7.0 mean100 -8.95 eps 0.513
ep 4200 reward -8.2 mean100 -8.65 eps 0.501
  -> saved models\dqn_snake_best.pt (best mean100 -8.56)
  -> saved models\dqn_snake_best.pt (best mean100 -8.54)
  -> saved models\dqn_snake_best.pt (best mean100 -8.53)
  -> saved models\dqn_snake_best.pt (best mean100 -8.53)
  -> saved models\dqn_snake_best.pt (best mean100 -8.52)
  -> saved models\dqn_snake_best.pt (best mean100 -8.52)
  -> saved models\dqn_snake_best.pt (best mean100 -8.50)
  -> saved models\dqn_snake_best.pt (best mean100 -8.48)
  -> saved models\dqn_snake_best.pt (best mean100 -8.48)
  -> saved models\dqn_snake_best.pt (best mean100 -8.47)
  -> saved models\dqn_snake_best.pt (best mean100 -8.46)
  -> saved models\dqn_snake_best.pt (best mean100 -8.45)
  -> saved models\dqn_snake_best.pt (best mean100 -8.45)
  -> saved models\dqn_snake_best.pt (best mean100 -8.44)
  -> saved models\dqn_snake_best.pt (best mean100 -8.43)
  -> saved models\dqn_snake_best.pt (best mean100 -8.43)
  -> saved models\dqn_snake_best.pt (best mean100 -8.41)
  -> saved models\dqn_snake_best.pt (best mean100 -8.40)
  -> saved models\dqn_snake_best.pt (best mean100 -8.39)
  -> saved models\dqn_snake_best.pt (best mean100 -8.39)
  -> saved models\dqn_snake_best.pt (best mean100 -8.36)
ep 4300 reward -8.5 mean100 -8.44 eps 0.489
ep 4400 reward -9.7 mean100 -8.48 eps 0.478
ep 4500 reward -9.7 mean100 -8.86 eps 0.466
ep 4600 reward -9.7 mean100 -8.79 eps 0.454
ep 4700 reward -8.3 mean100 -8.36 eps 0.442
  -> saved models\dqn_snake_best.pt (best mean100 -8.36)
  -> saved models\dqn_snake_best.pt (best mean100 -8.35)
  -> saved models\dqn_snake_best.pt (best mean100 -8.31)
  -> saved models\dqn_snake_best.pt (best mean100 -8.31)
ep 4800 reward -8.7 mean100 -8.77 eps 0.430
ep 4900 reward -7.9 mean100 -8.73 eps 0.418
  -> checkpoint models\dqn_snake_last.pt
ep 5000 reward -7.2 mean100 -8.50 eps 0.406
ep 5100 reward -9.8 mean100 -8.41 eps 0.394
  -> saved models\dqn_snake_best.pt (best mean100 -8.31)
  -> saved models\dqn_snake_best.pt (best mean100 -8.30)
  -> saved models\dqn_snake_best.pt (best mean100 -8.30)
  -> saved models\dqn_snake_best.pt (best mean100 -8.28)
  -> saved models\dqn_snake_best.pt (best mean100 -8.27)
  -> saved models\dqn_snake_best.pt (best mean100 -8.26)
  -> saved models\dqn_snake_best.pt (best mean100 -8.25)
  -> saved models\dqn_snake_best.pt (best mean100 -8.24)
  -> saved models\dqn_snake_best.pt (best mean100 -8.22)
  -> saved models\dqn_snake_best.pt (best mean100 -8.20)
  -> saved models\dqn_snake_best.pt (best mean100 -8.17)
  -> saved models\dqn_snake_best.pt (best mean100 -8.17)
  -> saved models\dqn_snake_best.pt (best mean100 -8.15)
  -> saved models\dqn_snake_best.pt (best mean100 -8.12)
  -> saved models\dqn_snake_best.pt (best mean100 -8.10)
  -> saved models\dqn_snake_best.pt (best mean100 -8.10)
  -> saved models\dqn_snake_best.pt (best mean100 -8.07)
  -> saved models\dqn_snake_best.pt (best mean100 -8.06)
  -> saved models\dqn_snake_best.pt (best mean100 -8.04)
  -> saved models\dqn_snake_best.pt (best mean100 -8.00)
  -> saved models\dqn_snake_best.pt (best mean100 -7.99)
  -> saved models\dqn_snake_best.pt (best mean100 -7.98)
  -> saved models\dqn_snake_best.pt (best mean100 -7.97)
  -> saved models\dqn_snake_best.pt (best mean100 -7.95)
  -> saved models\dqn_snake_best.pt (best mean100 -7.94)
  -> saved models\dqn_snake_best.pt (best mean100 -7.90)
  -> saved models\dqn_snake_best.pt (best mean100 -7.88)
ep 5200 reward -8.1 mean100 -7.99 eps 0.383
  -> saved models\dqn_snake_best.pt (best mean100 -7.88)
  -> saved models\dqn_snake_best.pt (best mean100 -7.87)
  -> saved models\dqn_snake_best.pt (best mean100 -7.87)
  -> saved models\dqn_snake_best.pt (best mean100 -7.83)
  -> saved models\dqn_snake_best.pt (best mean100 -7.83)
  -> saved models\dqn_snake_best.pt (best mean100 -7.81)
ep 5300 reward -8.4 mean100 -8.03 eps 0.371
ep 5400 reward -9.3 mean100 -8.22 eps 0.359
ep 5500 reward -8.2 mean100 -8.15 eps 0.347
  -> saved models\dqn_snake_best.pt (best mean100 -7.80)
  -> saved models\dqn_snake_best.pt (best mean100 -7.79)
  -> saved models\dqn_snake_best.pt (best mean100 -7.74)
  -> saved models\dqn_snake_best.pt (best mean100 -7.66)
  -> saved models\dqn_snake_best.pt (best mean100 -7.66)
  -> saved models\dqn_snake_best.pt (best mean100 -7.66)
  -> saved models\dqn_snake_best.pt (best mean100 -7.66)
  -> saved models\dqn_snake_best.pt (best mean100 -7.65)
  -> saved models\dqn_snake_best.pt (best mean100 -7.64)
  -> saved models\dqn_snake_best.pt (best mean100 -7.63)
  -> saved models\dqn_snake_best.pt (best mean100 -7.57)
  -> saved models\dqn_snake_best.pt (best mean100 -7.54)
  -> saved models\dqn_snake_best.pt (best mean100 -7.53)
  -> saved models\dqn_snake_best.pt (best mean100 -7.53)
  -> saved models\dqn_snake_best.pt (best mean100 -7.53)
ep 5600 reward -9.6 mean100 -7.64 eps 0.335
ep 5700 reward -5.4 mean100 -7.95 eps 0.323
ep 5800 reward -8.4 mean100 -8.29 eps 0.311
ep 5900 reward -9.9 mean100 -8.05 eps 0.299
  -> saved models\dqn_snake_best.pt (best mean100 -7.50)
  -> saved models\dqn_snake_best.pt (best mean100 -7.48)
  -> saved models\dqn_snake_best.pt (best mean100 -7.48)
  -> saved models\dqn_snake_best.pt (best mean100 -7.46)
  -> saved models\dqn_snake_best.pt (best mean100 -7.46)
  -> checkpoint models\dqn_snake_last.pt
ep 6000 reward -7.5 mean100 -7.74 eps 0.288
ep 6100 reward -8.1 mean100 -8.08 eps 0.276
ep 6200 reward -8.2 mean100 -7.94 eps 0.264
ep 6300 reward -7.3 mean100 -8.07 eps 0.252
ep 6400 reward -9.7 mean100 -8.50 eps 0.240
ep 6500 reward -6.0 mean100 -8.06 eps 0.228
ep 6600 reward -9.2 mean100 -8.63 eps 0.216
ep 6700 reward -8.3 mean100 -8.53 eps 0.204
ep 6800 reward -9.5 mean100 -8.24 eps 0.193
ep 6900 reward -8.2 mean100 -8.65 eps 0.181
  -> checkpoint models\dqn_snake_last.pt
ep 7000 reward -8.6 mean100 -8.68 eps 0.169
ep 7100 reward -9.5 mean100 -8.25 eps 0.157
ep 7200 reward -6.3 mean100 -8.15 eps 0.145
ep 7300 reward -7.4 mean100 -8.14 eps 0.133
ep 7400 reward -7.1 mean100 -7.69 eps 0.121
ep 7500 reward -9.6 mean100 -8.08 eps 0.109
ep 7600 reward -6.8 mean100 -8.32 eps 0.098
ep 7700 reward -5.2 mean100 -7.64 eps 0.086
  -> saved models\dqn_snake_best.pt (best mean100 -7.44)
  -> saved models\dqn_snake_best.pt (best mean100 -7.43)
  -> saved models\dqn_snake_best.pt (best mean100 -7.41)
  -> saved models\dqn_snake_best.pt (best mean100 -7.41)
  -> saved models\dqn_snake_best.pt (best mean100 -7.37)
  -> saved models\dqn_snake_best.pt (best mean100 -7.35)
  -> saved models\dqn_snake_best.pt (best mean100 -7.28)
  -> saved models\dqn_snake_best.pt (best mean100 -7.21)
  -> saved models\dqn_snake_best.pt (best mean100 -7.21)
  -> saved models\dqn_snake_best.pt (best mean100 -7.20)
  -> saved models\dqn_snake_best.pt (best mean100 -7.18)
  -> saved models\dqn_snake_best.pt (best mean100 -7.12)
  -> saved models\dqn_snake_best.pt (best mean100 -7.08)
  -> saved models\dqn_snake_best.pt (best mean100 -6.54)
  -> saved models\dqn_snake_best.pt (best mean100 -6.52)
  -> saved models\dqn_snake_best.pt (best mean100 -6.51)
  -> saved models\dqn_snake_best.pt (best mean100 -6.48)
  -> saved models\dqn_snake_best.pt (best mean100 -6.47)
  -> saved models\dqn_snake_best.pt (best mean100 -6.46)
  -> saved models\dqn_snake_best.pt (best mean100 -6.45)
  -> saved models\dqn_snake_best.pt (best mean100 -6.43)
  -> saved models\dqn_snake_best.pt (best mean100 -6.40)
  -> saved models\dqn_snake_best.pt (best mean100 -6.29)
  -> saved models\dqn_snake_best.pt (best mean100 -6.28)
  -> saved models\dqn_snake_best.pt (best mean100 -6.26)
  -> saved models\dqn_snake_best.pt (best mean100 -6.20)
  -> saved models\dqn_snake_best.pt (best mean100 -6.18)
  -> saved models\dqn_snake_best.pt (best mean100 -6.17)
ep 7800 reward -8.5 mean100 -6.21 eps 0.074
  -> saved models\dqn_snake_best.pt (best mean100 -6.13)
  -> saved models\dqn_snake_best.pt (best mean100 -6.12)
  -> saved models\dqn_snake_best.pt (best mean100 -6.10)
ep 7900 reward -9.2 mean100 -8.34 eps 0.062
  -> checkpoint models\dqn_snake_last.pt
ep 8000 reward -6.8 mean100 -8.90 eps 0.050
ep 8100 reward -6.9 mean100 -8.75 eps 0.050
ep 8200 reward -9.6 mean100 -9.09 eps 0.050
ep 8300 reward -9.8 mean100 -8.90 eps 0.050
ep 8400 reward -8.5 mean100 -8.81 eps 0.050
ep 8500 reward -9.7 mean100 -8.66 eps 0.050
ep 8600 reward -9.2 mean100 -8.63 eps 0.050
ep 8700 reward -9.6 mean100 -8.91 eps 0.050
ep 8800 reward -6.4 mean100 -9.12 eps 0.050
ep 8900 reward -8.4 mean100 -9.16 eps 0.050
  -> checkpoint models\dqn_snake_last.pt
ep 9000 reward -9.5 mean100 -8.93 eps 0.050
ep 9100 reward -9.8 mean100 -9.14 eps 0.050
ep 9200 reward -9.2 mean100 -8.36 eps 0.050
ep 9300 reward -9.4 mean100 -8.48 eps 0.050
ep 9400 reward -9.4 mean100 -8.19 eps 0.050
ep 9500 reward -6.4 mean100 -6.92 eps 0.050
ep 9600 reward -9.8 mean100 -8.39 eps 0.050
ep 9700 reward -5.8 mean100 -6.88 eps 0.050
ep 9800 reward -7.5 mean100 -7.97 eps 0.050
ep 9900 reward -7.4 mean100 -8.40 eps 0.050
ep 9999 reward -7.5 mean100 -8.11 eps 0.050
  -> checkpoint models\dqn_snake_last.pt
Done. Best mean100 reward: -6.10
